import joi from "joi";


export const signinCompanySchema = {
    body: joi.object({
        email: joi.string().email().required().min(5).messages({
            'string.empty': "email is required",
            'string.email': "plz enter valid email"
        }),

        password: joi.string().required().min(6).max(20).messages({
            'string.empty': "password is required"
        })
    })

}

export const signinEmployeeSchema = {
    body: joi.object({
        userName: joi.string().alphanum().required().messages({
            'string.empty': "userName is required"
        }),

        password: joi.string().required().min(6).max(20).messages({
            'string.empty': "password is required"
        }),
                
        deviceId: joi.string().required().max(16)
    })
}

export const testSchema = {
    query: joi.object({
        page: joi.number().min(1),
        perPage: joi.number().min(3).max(20)
    })
}