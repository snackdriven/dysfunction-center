import { api } from "encore.dev/api";
import { taskDB } from "./encore.service";
import {
  TaskTag,
  CreateTagRequest,
  CreateTagResponse,
  GetTagsResponse,
  DeleteTagResponse
} from "./types";
import { sanitizeString } from "../shared/utils";

async function collectResults<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const result of generator) {
    results.push(result);
  }
  return results;
}

export const createTag = api(
  { method: "POST", path: "/tasks/tags", expose: true },
  async (req: CreateTagRequest): Promise<CreateTagResponse> => {
    try {
      if (!req.name || req.name.trim() === '') {
        throw new Error("Tag name is required");
      }

      const name = sanitizeString(req.name, 50).toLowerCase();

      // Check if tag already exists
      const existingGenerator = taskDB.query`
        SELECT id FROM task_tags WHERE LOWER(name) = ${name}
      `;
      const existing = await collectResults(existingGenerator);
      
      if (existing.length > 0) {
        throw new Error("Tag with this name already exists");
      }

      const generator = taskDB.query`
        INSERT INTO task_tags (name, created_at)
        VALUES (${name}, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const result = await collectResults(generator);
      if (result.length === 0) {
        throw new Error("Failed to create tag");
      }

      const tagRow = result[0];
      const tag: TaskTag = {
        id: tagRow.id,
        name: tagRow.name,
        created_at: tagRow.created_at
      };

      return { tag };
    } catch (error) {
      throw new Error(`Failed to create tag: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const getTags = api(
  { method: "GET", path: "/tasks/tags", expose: true },
  async (req: { search?: string }): Promise<GetTagsResponse> => {
    try {
      let generator;
      
      if (req.search && req.search.trim() !== '') {
        const searchTerm = `%${sanitizeString(req.search, 50).toLowerCase()}%`;
        generator = taskDB.query`
          SELECT * FROM task_tags 
          WHERE LOWER(name) LIKE ${searchTerm}
          ORDER BY name ASC
        `;
      } else {
        generator = taskDB.query`
          SELECT * FROM task_tags ORDER BY name ASC
        `;
      }

      const result = await collectResults(generator);
      const tags: TaskTag[] = result.map((row: any) => ({
        id: row.id,
        name: row.name,
        created_at: row.created_at
      }));

      return { tags };
    } catch (error) {
      throw new Error(`Failed to get tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const deleteTag = api(
  { method: "DELETE", path: "/tasks/tags/:id", expose: true },
  async ({ id }: { id: number }): Promise<DeleteTagResponse> => {
    try {
      // Check if tag is in use
      const usageGenerator = taskDB.query`
        SELECT COUNT(*) as usage_count FROM task_tag_assignments WHERE tag_id = ${id}
      `;
      const usage = await collectResults(usageGenerator);
      
      if (usage[0].usage_count > 0) {
        throw new Error("Cannot delete tag that is assigned to tasks");
      }

      const generator = taskDB.query`
        DELETE FROM task_tags WHERE id = ${id}
        RETURNING id
      `;

      const result = await collectResults(generator);
      if (result.length === 0) {
        throw new Error("Tag not found");
      }

      return {
        success: true,
        message: "Tag deleted successfully"
      };
    } catch (error) {
      throw new Error(`Failed to delete tag: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);