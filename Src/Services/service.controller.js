export const calculateNetworkAddress = (ipAddress, subnetMask) => {
    const ipOctets = ipAddress.split('.').map(Number);
    const subnetOctets = subnetMask.split('.').map(Number);
    const networkOctets = [];

    for (let i = 0; i < 4; i++) {
        networkOctets.push(ipOctets[i] & subnetOctets[i]);
    }
    const networkAddress = networkOctets.join('.');

    return networkAddress;
}