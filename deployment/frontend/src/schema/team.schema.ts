import { Option } from "@/components/_shared/SimpleSelect";
import z from "zod";

export const TeamSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .regex(
      /^[^\(\) +]+$/,
      "The name cant have spaces nor the dot(.) character, it needs to be URL Compatible"
    ),
  title: z.string(),
  image_display_url: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  parent: z.preprocess((val) => {
    if (typeof val === 'string') return val
    if (isParent(val)) return val.value
    return null
  }, z.string().nullable()),
});

const isParent = (val: any): val is Option<string> => {
  return val && val.value && typeof val.value === 'string'
}

export type TeamFormType = z.infer<typeof TeamSchema>;
