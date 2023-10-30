import bcrypt from 'bcryptjs'
import employeeModel from '../../../../DB/Models/Employee.model.js';

export const createEmployee = async (req, res) => {
    // return res.json({ user: req.user });
    let employeeData = req.body;
    const { email, userName, phoneNumber, startChecking, endChecking } = employeeData;
    const employee = await employeeModel.findOne({
        $or: [
            { email },
            { userName },
            { phoneNumber }
        ]
    });

    if (employee) {
        const message =
            employee.email === employeeData.email ? "Email exists" :
                employee.userName === employeeData.userName ? "User Name exists" :
                    employee.phoneNumber === employeeData.phoneNumber ? "Phone Number exists" :
                        "";

        return res.status(409).json({ message });
    }

    const hashedPasswored = bcrypt.hashSync(employeeData.password, parseInt(process.env.SALT_ROUND));
    employeeData.password = hashedPasswored;
    employeeData.companyId = req.user._id;

    // let hours = (startChecking).split(':')[0];
    // let minutes = (startChecking).split(':')[1];

    // employeeData.startChecking = {hours, minutes};

    // hours = (endChecking).split(':')[0];
    // minutes = (endChecking).split(':')[1];

    // employeeData.endChecking = {hours, minutes};

    const createUser = await employeeModel.create(employeeData);
    return res.status(201).json({ message: "Employee added successfuly", createUser });

}

export const editIPAddress = async (req, res) => {
    const company = req.user;
    const { IPAddress, subnetMask } = req.body;
    company.IPAddress = calculateNetworkAddress(IPAddress, subnetMask);
    await company.save();
    return res.status(201).json({ message: "IP Address edited successfully", newIPAddress: company.IPAddress });
}

function calculateNetworkAddress(ipAddress, subnetMask) {
    const ipOctets = ipAddress.split('.').map(Number);
    const subnetOctets = subnetMask.split('.').map(Number);
    const networkOctets = [];

    for (let i = 0; i < 4; i++) {
        networkOctets.push(ipOctets[i] & subnetOctets[i]);
    }
    const networkAddress = networkOctets.join('.');

    return networkAddress;
}
//checkin