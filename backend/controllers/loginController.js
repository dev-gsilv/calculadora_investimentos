export const login = async (req, res) => {
    return res.status(403).json({msg: 'Login TBD'})
}

export const login2 = async (req,res) => {
    const { email, password } = req.body

    const rawUser = {email, password}
    const fail = await validateLogin(rawUser)
    if(fail){
        return res.status(422).json({msg: fail})
    }

    try {
        const secret = process.env.SECRET
        const user = await User.findOne({ email:rawUser.email })
        const token = jwt.sign(
            {
                id: user._id,
            },
            secret
        )

        res.status(200).json({ msg: 'Authentication successful!', token })
        
    } catch (e) {
        console.error(e)
        res.status(500).json({msg: 'Server error. Please, try again!'})
    }
}