const dataMethods = ['body', 'query', 'params', 'headers'];
const validation = (Schema) => {
    return (req, res, next) => {
        const validationArray = [];
        dataMethods.forEach((key) => {
            if (Schema[key]) {
                const validationResult = Schema[key].validate(req[key], { aborEarly: false });

                if (validationResult.error) {
                    validationArray.push(validationResult.error.details);
                }
            }
        })

        if (validationArray.length > 0) {
            return res.status(403).json({ message: "validation error", validationArray });
        }
        else {
            next();
        }
    }
}


export default validation;