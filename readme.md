# SIMULFIX

> ### API para simular investimentos em renda fixa.

<br>

Tipos de investimento suportados:
| Isento de Imposto de Renda | Imposto de Renda Regressivo |
| ------ | ------ |
| LCI, LCA, CRI, CRA, Poupança | CDB, Tesouro |

| Indexadores | Exemplos       |
| ----------- | -------------- |
| Pré-Fixado  | 9% a.a.        |
| Pós-Fixado  | 103% da CDI    |
| Misto       | IPCA + 5% a.a. |

<br>

---

### Como usar?

Para criar suas simulações, você deve criar um perfil de usuário. Todo perfil deve ter:

-   Nome.
-   E-mail.
-   Senha.

Com seu perfil cadastrado, você já pode fazer login e começar a criar suas simulações.
Para criar uma simulação, você deve informar:

-   Nome para a simulação.
-   Tipo de investimento.
-   Indexador.
-   Valor do investimento.
-   Prazo, em meses.
-   Rentabilidade anual.

<br>

---

### Documentação

Para mais detalhes em como criar uma simulação, explore a [documentação Swagger](http://54.86.27.160:5000/api-docs/).
