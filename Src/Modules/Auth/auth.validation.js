import joi from 'joi'
  

export const signinSchemaCompany=joi.object({
    email:joi.string().email().required().min(5).messages({
        'string.empty':"email is required",
        'string.email':"plz enter valid email"
    }),


    password:joi.string().required().min(3).max(20).messages({
          'string.empty':"password is required"
    })

})


export const signinSchemaEmployee=joi.object({
     userName:joi.string().alphanum().required().messages({
        'string.empty':"userName is required"
     }),

     password:joi.string().required().min(8).max(20).messages({
        'string.empty':"password is required"
  })
})



export const createSchemaEmployee = {
    body: joi.object({
        fullName:joi.string().required(),
        userName: joi.string().alphanum().required(),
         phoneNumber:joi.number().required(),
        email: joi.string().email().required(),
        password: joi.string().min(8).max(20).required(),
        cpassword: joi.valid(joi.ref('password')).required(),
        creationDate:joi.string().required(),
        macAddress:joi.string().alphanum().required(),
        companyId:joi.string().required(),
        startChecking:joi.string().alphanum().required(),
        endChecking:joi.string().alphanum().required()
   
   
    }),
  
}