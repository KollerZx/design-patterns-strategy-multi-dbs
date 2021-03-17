const Mongoose = require('mongoose');

Mongoose.connect('mongodb://henrique:minhasenha@localhost:27017/clientes', { useNewUrlParser: true, useUnifiedTopology:true }, function(error){
    if (!error) return;

    console.log('Failed to connect!', error);
});

const connection = Mongoose.connection

connection.once('open', () => console.log('Database is running!'))
/* 
setTimeout(() =>{
    const state = connection.readyState

    console.log('state', state)

},1000)
 */
/* 
    0: Disconnected
    1: Connected
    2: Connecting
    3: Disconnecting

*/
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
    insertedAt:{
        type: Date,
        default: new Date()
    }
})
/* Registra o modelo */

const model = Mongoose.model('clientes', clienteSchema)

async function main(){
    const resultCadastrar = await model.create({
        nome: 'Henrique',
        profissao:'Developer FullStack'
    })

    console.log('result cadastrar', resultCadastrar)

    const listItens = await model.find()
    console.log('items', listItens)
}
main()