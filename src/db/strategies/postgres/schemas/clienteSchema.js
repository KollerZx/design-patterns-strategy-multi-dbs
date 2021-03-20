const Sequelize = require('sequelize')

const ClienteSChema = {
    name: 'clientes',
    schema:{
        id: {
            type: Sequelize.INTEGER,
            required: true,
            primaryKey: true,
            autoIncrement: true
        },
        nome: {
                type: Sequelize.STRING,
                required: true
        },
        profissao:{
            type: Sequelize.STRING,
            required: true
        } 
    },
    options:{
        tableName: 'CLIENTES',
        freezeTable: false,
        timestamps:false
    }
}


module.exports = ClienteSChema