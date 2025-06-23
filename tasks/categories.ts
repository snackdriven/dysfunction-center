import { api } from "encore.dev/api";
import { taskDB } from "./encore.service";
import {
  TaskCategory,
  CreateCategoryRequest,
  CreateCategoryResponse,
  GetCategoriesResponse,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
  DeleteCategoryResponse
} from "./types";
import { sanitizeString } from "../shared/utils";

async function collectResults<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const result of generator) {
    results.push(result);
  }
  return results;
}

export const createCategory = api(
  { method: "POST", path: "/tasks/categories", expose: true },
  async (req: CreateCategoryRequest): Promise<CreateCategoryResponse> => {
    try {
      if (!req.name || req.name.trim() === '') {
        throw new Error("Category name is required");
      }

      const name = sanitizeString(req.name, 100);
      const color = req.color ? sanitizeString(req.color, 7) : null;
      const icon = req.icon ? sanitizeString(req.icon, 50) : null;

      // Check if category already exists
      const existingGenerator = taskDB.query`
        SELECT id FROM task_categories WHERE LOWER(name) = LOWER(${name})
      `;
      const existing = await collectResults(existingGenerator);
      
      if (existing.length > 0) {
        throw new Error("Category with this name already exists");
      }

      const generator = taskDB.query`
        INSERT INTO task_categories (name, color, icon, created_at)
        VALUES (${name}, ${color}, ${icon}, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const result = await collectResults(generator);
      if (result.length === 0) {
        throw new Error("Failed to create category");
      }

      const categoryRow = result[0];
      const category: TaskCategory = {
        id: categoryRow.id,
        name: categoryRow.name,
        color: categoryRow.color,
        icon: categoryRow.icon,
        created_at: categoryRow.created_at
      };

      return { category };
    } catch (error) {
      throw new Error(`Failed to create category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const getCategories = api(
  { method: "GET", path: "/tasks/categories", expose: true },
  async (): Promise<GetCategoriesResponse> => {
    try {
      const generator = taskDB.query`
        SELECT * FROM task_categories ORDER BY name ASC
      `;

      const result = await collectResults(generator);
      const categories: TaskCategory[] = result.map((row: any) => ({
        id: row.id,
        name: row.name,
        color: row.color,
        icon: row.icon,
        created_at: row.created_at
      }));

      return { categories };
    } catch (error) {
      throw new Error(`Failed to get categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const updateCategory = api(
  { method: "PUT", path: "/tasks/categories/:id", expose: true },
  async (req: UpdateCategoryRequest): Promise<UpdateCategoryResponse> => {
    try {
      const { id, ...updates } = req;

      const existingGenerator = taskDB.query`
        SELECT * FROM task_categories WHERE id = ${id}
      `;
      const existing = await collectResults(existingGenerator);

      if (existing.length === 0) {
        throw new Error("Category not found");
      }

      const existingCategory = existing[0];
      const name = updates.name ? sanitizeString(updates.name, 100) : existingCategory.name;
      const color = updates.color !== undefined ? 
        (updates.color ? sanitizeString(updates.color, 7) : null) : existingCategory.color;
      const icon = updates.icon !== undefined ? 
        (updates.icon ? sanitizeString(updates.icon, 50) : null) : existingCategory.icon;

      // Check for duplicate names (excluding current category)
      if (updates.name) {
        const duplicateGenerator = taskDB.query`
          SELECT id FROM task_categories 
          WHERE LOWER(name) = LOWER(${name}) AND id != ${id}
        `;
        const duplicates = await collectResults(duplicateGenerator);
        
        if (duplicates.length > 0) {
          throw new Error("Category with this name already exists");
        }
      }

      const updateGenerator = taskDB.query`
        UPDATE task_categories 
        SET name = ${name}, color = ${color}, icon = ${icon}
        WHERE id = ${id}
        RETURNING *
      `;

      const result = await collectResults(updateGenerator);
      const categoryRow = result[0];

      const category: TaskCategory = {
        id: categoryRow.id,
        name: categoryRow.name,
        color: categoryRow.color,
        icon: categoryRow.icon,
        created_at: categoryRow.created_at
      };

      return { category };
    } catch (error) {
      throw new Error(`Failed to update category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const deleteCategory = api(
  { method: "DELETE", path: "/tasks/categories/:id", expose: true },
  async ({ id }: { id: number }): Promise<DeleteCategoryResponse> => {
    try {
      // Check if category is in use
      const usageGenerator = taskDB.query`
        SELECT COUNT(*) as task_count FROM tasks WHERE category_id = ${id}
      `;
      const usage = await collectResults(usageGenerator);
      
      if (usage[0].task_count > 0) {
        throw new Error("Cannot delete category that is in use by tasks");
      }

      const generator = taskDB.query`
        DELETE FROM task_categories WHERE id = ${id}
        RETURNING id
      `;

      const result = await collectResults(generator);
      if (result.length === 0) {
        throw new Error("Category not found");
      }

      return {
        success: true,
        message: "Category deleted successfully"
      };
    } catch (error) {
      throw new Error(`Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);