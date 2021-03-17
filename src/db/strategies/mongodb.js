const ICrud = require('./interfaces/interfaceCrud')
const Mongoose = require('mongoose');

const STATUS = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
}
class MongoDB extends ICrud {
    constructor() {
        super()
        this._clientes = null;
        this._driver = null;
    }
    async isConnected() {
    
        const state = STATUS[this._driver.readyState]

        if(state === 'Connected') return state;

        if(state !== 'Connecting') return state;

        await new Promise(resolve => setTimeout(resolve,1000))

        return STATUS[this._driver.readyState]
    }
    defineModel() {
        /* Cria o modelo de validação de como a coleção será  */
        const clienteSchema = new Mongoose.Schema({
            nome: {
                type: String,
                required: true
            },
            profissao: {
                type: String,
                required: true
            },
            insertedAt: {
                type: Date,
                default: new Date()
            }
        })
        /* Registra o modelo na tabela clientes com o Schema definido*/

        this._clientes = Mongoose.model('clientes', clienteSchema)
    }
    connect() {
        Mongoose.connect('mongodb://henrique:minhasenha@localhost:27017/clientes', { useNewUrlParser: true, useUnifiedTopology: true }, function (error) {
            if (!error) return;

            console.log('Failed to connect!', error);
        });

        const connection = Mongoose.connection
        this._driver = connection
        connection.once('open', () => console.log('Database is running!'))

        this.defineModel()
        
    }
    create(item) {
        return this._clientes.create(item)
    }
}
module.exports = MongoDB;