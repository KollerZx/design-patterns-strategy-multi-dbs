/* 
Para visualizar se o mongodb esta rodando
sudo docker ps 

copia o id do container do mongo

sudo docker exec -it c8c37b75fce3 mongo -u henrique -p minhasenha --authenticationDatabase clientes

Exibe todos os databases disponiveis
show dbs

Muda o contexto para um database especifico
use clientes

mostra as tabelas (coleçoes)
show collections
*/


db.clientes.insert({
    nome: 'Henrique',
    Profissao:'Developer Full Stack',
    dataNascimento: '1993-08-23'
})

db.clientes.find()
/* Retorna a consulta formatada */
db.clientes.find().pretty()


for (let i=0; i<=50; i ++){
    db.clientes.insert({
        nome: `Clone-${i}`,
        profissao: 'clonar',
        dataNascimento: '2000-01-01'
    })
}
/* Retorna a quantidade de registros na tabela */
db.clientes.count()

db.clientes.findOne()

/* Limita o resultado 10 registros e ordena pelo nome decrescente */
db.clientes.find().limit(10).sort({name: -1})

/* Retorna somente a coluna Profissao e oculta a coluna id 
Por padrão a consulta retorna a coluna que foi solicitada (profissao), e o id.
Para ocultar o id, passamos o parametro (_id:0)
*/
db.clientes.find({}, {profissao:1, _id:0})


//create

db.clientes.insert({
    nome: 'Henrique',
    Profissao:'Developer Full Stack',
    dataNascimento: '1993-08-23'
})

//read
db.clientes.find()

//Update

/* No mongoDB caso nao seja especificado o que deseja realizar, pode-se ocorrer perda de dados
no Exemplo abaixo, o comando irá sobrescrever o objeto que corresponda ao id passado, ao consultar, se notará que o objeto só possuirá o campo profissão */
db.clientes.update({_id: ObjectId("604f54b424bb72ba28aa064e")}, {Profissao:'Operador de Caldeira'})

/* Para isso, é necessários espeficiar qual campo se deseja alterar, usando {$set:{chave:'valor'}} 
Outro problema é caso se erre o nome do campo a ser alterado, o mongo irá incluir o campo no registro
*/
db.clientes.update({_id: ObjectId("604f54b424bb72ba28aa064e")},{$set: {nome: 'Henrique'}})

//delete

/* Por padrão o mongo nao permite que se passe o remove sem where, irá retornar uma exceçao informando
Caso realmente se deseje remover todos os dados da base, deve se explicitar passando as {} */
db.clientes.remove()

db.clientes.remove({nome: 'Henrique'})