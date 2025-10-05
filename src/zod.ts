import z from "zod";

export const UserSignupSchema = z.object({
    name: z.string().optional(),
    password: z.string().min(3),
    email: z.email()
});


export const  UserSigninSchema = UserSignupSchema.pick({
    email: true,
    password: true
})

export const BlogCreateSchema = z.object({
    title: z.string(),
    content: z.string(),
})