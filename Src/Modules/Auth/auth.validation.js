import joi from 'joi'


export const signinCompanySchema = joi.object({
    email: joi.string().email().required().min(5).messages({
        'string.empty': "email is required",
        'string.email': "plz enter valid email"
    }),


    password: joi.string().required().min(3).max(20).messages({
        'string.empty': "password is required"
    })

});


export const signinEmployeeSchema = joi.object({
    userName: joi.string().alphanum().required().messages({
        'string.empty': "userName is required"
    }),

    password: joi.string().required().min(8).max(20).messages({
        'string.empty': "password is required"
    })
});



