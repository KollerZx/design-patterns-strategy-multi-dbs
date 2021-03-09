const Sequelize = require('sequelize')
const driver = new Sequelize(
    'clientes', //database
    'henrique', 
    'minhasenha',

    {
        host: 'localhost',
        dialect:'postgres', //tipo do driver
        quoteIdentifiers: false,
        operatorsAliases: 0
    }
)

async function main() {
    const Clientes = driver.define('clientes', {
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
        
    }, {
        tableName: 'CLIENTES',
        freezeTable: false,
        timestamps:false
    })

    await Clientes.sync()

    await Clientes.create({
        nome:'Henrique',
        profissao:'Developer FullStack'
    })
    const result = await Clientes.findAll({raw:true})

    console.log('result', result)
}

main()