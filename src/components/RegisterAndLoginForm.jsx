import { useContext, useState } from 'react'
import axios from 'axios'
import { UserContext } from '../UserContext'

export default function RegisterAndLoginForm() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isLoginOrRegister, setIsLoginOrRegister] = useState('login')
    const { setUsername: setLoggedInUsername, setId } = useContext(UserContext) //renomeando
    const handleSubmit = async (evt) => {
        evt.preventDefault()
        const url = isLoginOrRegister === 'register' ? 'register' : 'login'
        const { data } = await axios.post(url, { username, password })
        setLoggedInUsername(username)
        setId(data.id) //data.id é retornado da response em formato json
    }
    return (
        <div className='bg-blue-100 h-screen flex items-center'>
            <form className='w-60 mx-auto mb-12' onSubmit={handleSubmit}>
                <input type="text"
                    value={username}
                    onChange={(evt) => {
                        setUsername(evt.target.value)
                    }}
                    placeholder='username'
                    className='block w-full rounded p-2 mb-2 border' />
                <input type="password"
                    value={password}
                    onChange={(evt) => {
                        setPassword(evt.target.value)
                    }}
                    placeholder='password'
                    className='block w-full rounded p-2 mb-2 border' />
                <button className='bg-blue-500 text-white blick w-full rounded p-2'>{isLoginOrRegister === 'register' ? 'Registrar' : 'Login'}</button>
                <div className='text-center mt-2'>
                    {isLoginOrRegister === 'register' && (
                        <div>
                            Já está cadastrado?
                            <button onClick={() => {
                                setIsLoginOrRegister('login')
                            }}>
                                Login
                            </button>
                        </div>
                    )
                    }
                    {isLoginOrRegister === 'login' && (
                        <div>
                            Não está cadastrado?
                            <button onClick={() => {
                                setIsLoginOrRegister('register')
                            }}>
                                Cadastrar
                            </button>
                        </div>
                    )}
                </div>
            </form >

        </div >
    )
}
