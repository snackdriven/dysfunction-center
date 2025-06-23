import { api } from "encore.dev/api";
import { habitDB } from "./encore.service";
import {
  HabitTemplate,
  Habit,
  GetTemplatesRequest,
  GetTemplatesResponse,
  CreateFromTemplateRequest,
  CreateFromTemplateResponse
} from "./types";
import { sanitizeString, isValidHabitCategory } from "../shared/utils";

async function collectResults<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const result of generator) {
    results.push(result);
  }
  return results;
}

export const getTemplates = api(
  { method: "GET", path: "/habits/templates", expose: true },
  async (req: GetTemplatesRequest): Promise<GetTemplatesResponse> => {
    try {
      let generator;
      
      if (req.category) {
        const category = sanitizeString(req.category, 50);
        generator = habitDB.query`
          SELECT * FROM habit_templates 
          WHERE category = ${category}
          ORDER BY name ASC
        `;
      } else {
        generator = habitDB.query`
          SELECT * FROM habit_templates ORDER BY category ASC, name ASC
        `;
      }

      const result = await collectResults(generator);
      const templates: HabitTemplate[] = result.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        category: row.category,
        suggested_target_type: row.suggested_target_type,
        suggested_target_value: row.suggested_target_value,
        suggested_unit: row.suggested_unit,
        icon: row.icon,
        created_at: row.created_at
      }));

      return { templates };
    } catch (error) {
      throw new Error(`Failed to get templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const createHabitFromTemplate = api(
  { method: "POST", path: "/habits/from-template/:template_id", expose: true },
  async (req: CreateFromTemplateRequest): Promise<CreateFromTemplateResponse> => {
    try {
      const { template_id, name, target_value, reminder_enabled, reminder_time } = req;

      // Get the template
      const templateGenerator = habitDB.query`
        SELECT * FROM habit_templates WHERE id = ${template_id}
      `;
      const templateResult = await collectResults(templateGenerator);

      if (templateResult.length === 0) {
        throw new Error("Template not found");
      }

      const template = templateResult[0];

      // Prepare habit data from template
      const habitName = name ? sanitizeString(name, 255) : template.name;
      const habitDescription = template.description;
      const habitCategory = template.category || 'personal';
      const habitTargetType = template.suggested_target_type || 'daily';
      const habitTargetValue = target_value !== undefined ? target_value : template.suggested_target_value;
      const habitUnit = template.suggested_unit;
      const habitReminderEnabled = reminder_enabled || false;
      const habitReminderTime = reminder_time || null;

      // Validate category
      if (!isValidHabitCategory(habitCategory)) {
        throw new Error("Invalid habit category from template");
      }

      // Create the habit
      const habitGenerator = habitDB.query`
        INSERT INTO habits (
          name, description, category, target_frequency, active,
          target_type, completion_type, target_value, unit, template_id,
          reminder_enabled, reminder_time, created_at, updated_at
        )
        VALUES (
          ${habitName}, ${habitDescription}, ${habitCategory}, 1, TRUE,
          ${habitTargetType}, 'count', ${habitTargetValue}, ${habitUnit}, ${template_id},
          ${habitReminderEnabled}, ${habitReminderTime}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING *
      `;

      const habitResult = await collectResults(habitGenerator);
      if (habitResult.length === 0) {
        throw new Error("Failed to create habit from template");
      }

      const habitRow = habitResult[0];
      const habit: Habit = {
        id: habitRow.id,
        name: habitRow.name,
        description: habitRow.description,
        category: habitRow.category,
        target_frequency: habitRow.target_frequency,
        active: habitRow.active,
        created_at: habitRow.created_at,
        updated_at: habitRow.updated_at,
        target_type: habitRow.target_type,
        completion_type: habitRow.completion_type,
        target_value: habitRow.target_value,
        unit: habitRow.unit,
        template_id: habitRow.template_id,
        template: {
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          suggested_target_type: template.suggested_target_type,
          suggested_target_value: template.suggested_target_value,
          suggested_unit: template.suggested_unit,
          icon: template.icon,
          created_at: template.created_at
        },
        reminder_enabled: habitRow.reminder_enabled,
        reminder_time: habitRow.reminder_time
      };

      return { habit };
    } catch (error) {
      throw new Error(`Failed to create habit from template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);