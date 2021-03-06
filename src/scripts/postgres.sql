DROP TABLE IF EXISTS CLIENTES;

CREATE TABLE CLIENTES(
    ID INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY NOT NULL,
    NOME TEXT NOT NULL,
    PROFISSAO TEXT NOT NULL
);

--create
INSERT INTO CLIENTES (NOME, PROFISSAO) VALUES ('Henrique', 'Developer FullStack'),('Mariana', 'Nutricionista');

--read
SELECT * FROM CLIENTES; 

SELECT * FROM CLIENTES WHERE NOME = 'Henrique'; 

--update

UPDATE CLIENTES SET NOME = 'Koller', PROFISSAO = 'Operador de Caldeira'
where NOME = 'Henrique'

--delete

DELETE FROM CLIENTES WHERE ID = 1;