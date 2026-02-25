import { z } from "zod";

export const createPromptSchema = z.object({
  title: z.string().min(1, "Введите заголовок").max(200, "Максимум 200 символов"),
  content: z.string().min(1, "Введите текст промта"),
  isPublic: z.boolean().default(false),
});

export const updatePromptSchema = createPromptSchema.extend({
  id: z.string().min(1, "ID обязателен"),
});

export type CreatePromptInput = z.infer<typeof createPromptSchema>;
export type UpdatePromptInput = z.infer<typeof updatePromptSchema>;
