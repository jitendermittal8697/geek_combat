const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('mysql://root:password@localhost:3306/geek_combat')

var dbconn = async () => {
    try {
        await sequelize.authenticate();
        return sequelize;

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
    return false;
};

module.exports = {
    dbconn
}
