import mongoose from "mongoose";

export const investSchema = new mongoose.Schema(
    { 
        nome: String, 
        tipo: String,
        indexador: String,
        prazo: Number,
        valorInvestido: Number,
        valorJuros: Number,
        valorTotalBruto: Number,        
        valorTotalLiquido: Number,
        impostoRenda: {
            valor: {
                type: Number
            },
            incidente: {
                type: Boolean
            }
        }
    },
    { timestamps: true }
)

const Investimento = mongoose.model('Investimento', investSchema);

export default Investimento