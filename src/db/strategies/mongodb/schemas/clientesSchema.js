const Mongoose = require('mongoose');
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

module.exports = Mongoose.model('clientes', clienteSchema)