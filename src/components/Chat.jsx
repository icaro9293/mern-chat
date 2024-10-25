import { useContext, useEffect, useRef, useState } from 'react'
import Avatar from './Avatar'
import Logo from './Logo'
import { UserContext } from '../UserContext'
import { uniqBy } from 'lodash' //lodash é uma biblioteca com diversas funções para problemas comuns.
import axios from 'axios'
import Contatos from './Contatos'

export default function Chat() {
    const [ws, setWs] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState({})
    const [offlineUsers, setOfflineUsers] = useState({})
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [newMessageText, setNewMessageText] = useState('')
    const [mensagens, setMensagens] = useState([])
    const { username, id, setId, setUsername } = useContext(UserContext)
    const divUnderMsg = useRef()

    useEffect(() => {
        connectToWs()
    }, [])

    const connectToWs = () => {
        const wss = new WebSocket('ws://localhost:4000/test')
        setWs(wss)
        wss.addEventListener('message', handleMessage)
        wss.addEventListener('close', () => {
            setTimeout(() => {
                console.log('desconectado. Tentando reconectar.')
                connectToWs()
            }, 1000);
        })
    }

    const showOnlineUsers = (usersArray) => {
        //desta forma para não mostrar usuários repetidos toda vez q o react for renderizado.
        const users = {}
        usersArray.forEach(({ userId, username }) => {
            users[userId] = username //variável apenas para display, aqui o nome da key é id e será o nome do usuário.
        })
        console.log(users)
        setOnlineUsers(users)
        console.log('objeto onlineUsers', onlineUsers)
    }

    const handleMessage = (evt) => {
        // console.log('nova mensagem: ', e)
        const messageData = JSON.parse(evt.data)
        console.log({ evt, messageData })
        if ('online' in messageData) {
            showOnlineUsers(messageData.online)
        } else if ('text' in messageData) {
            if (messageData.sender === selectedUserId) {
                setMensagens(prev => ([...prev, { ...messageData }]))
            }
        }
    }

    const logout = () => {
        axios.post('/logout').then(() => {
            setWs(null)
            setId(null)
            setUsername(null)
        })
    }

    const sendMessage = (evt, file = null) => {
        if (evt) {
            evt.preventDefault()
        }
        ws.send(JSON.stringify({
            receptor: selectedUserId,
            text: newMessageText,
            file
        }))

        if (file) {
            if (selectedUserId) {
                axios.get('/messages/' + selectedUserId).then((res) => {
                    const { data } = res
                    setMensagens(data)

                })
            }
        } else {
            setMensagens(prev => ([...prev, { text: newMessageText, sender: id, receptor: selectedUserId, _id: Date.now() }]))
            setNewMessageText('')
        }
    }

    const sendFile = (evt) => {
        const reader = new FileReader()
        reader.readAsDataURL(evt.target.files[0])
        reader.onload = () => {
            sendMessage(null, {
                name: evt.target.files[0].name,
                data: reader.result
            })
        }
    }

    //o scroll automatico tem q ficar no useeffect pois o setMensagen é uma promise e demora alguns segundos, então aqui o scroll é atualizado após mensagens ser renderizada.
    useEffect(() => {
        const div = divUnderMsg.current
        if (div) {
            div.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }
    }, [mensagens])

    useEffect(() => {
        axios.get('/users').then((res) => {
            const usersOfflineArr = res.data
                .filter(u => u._id !== id) // tirando eu mesmo da lista.
                .filter(u => !Object.keys(onlineUsers).includes(u._id)) // tirando  quem está online
            const usersOffline = {}
            usersOfflineArr.forEach((u) => {
                usersOffline[u._id] = u
            })
            setOfflineUsers(usersOffline)
        })
    }, [onlineUsers])


    //pegar as mensagens do database quando clicar em um usuario.
    useEffect(() => {
        if (selectedUserId) {
            axios.get('/messages/' + selectedUserId).then((res) => {
                const { data } = res
                setMensagens(data)

            })
        }
    }, [selectedUserId])

    const onlineUsersExcludingOurself = { ...onlineUsers }
    delete onlineUsersExcludingOurself[id] // a key do user é a própria id, e o valor é o username.

    //utilizando função uniqBy do lodash
    const messagesWithoutDuplicates = uniqBy(mensagens, '_id') // cada mensagem tem as propriedades 'text', 'sender' e 'id'. Retorna o array sem a duplicata.


    return (
        <div className='flex h-screen'>
            <div className="bg-blue-100 w-1/3 p-3 pr-0 flex flex-col">
                <div className='flex-grow'>
                    <Logo></Logo>
                    {username}
                    {/* como 'onlineUsers é um objeto, e não uma lista, é preciso usar o 'Object.keys para mapear */}
                    {Object.keys(onlineUsersExcludingOurself).map((u) => (
                        <>
                            <Contatos
                                key={u}
                                id={u}
                                online={true}
                                username={onlineUsersExcludingOurself[u]}
                                onClick={() => setSelectedUserId(u)}
                                selected={u === selectedUserId}
                            ></Contatos>
                        </>
                    ))
                    }
                    {Object.keys(offlineUsers).map((u) => (
                        <>
                            <Contatos
                                key={u}
                                id={u}
                                online={false}
                                username={offlineUsers[u].username}
                                onClick={() => setSelectedUserId(u)}
                                selected={u === selectedUserId}
                            ></Contatos>
                        </>
                    ))
                    }
                </div>
                <div className='p-2 text-center'>
                    <span className='mr-2 text-sm'>Welcome {username}</span>
                    <button
                        onClick={logout}
                        className='text-sm text-gray-400 px-2 py-1 bg-blue-100 rounded'>
                        Logout
                    </button>
                </div>
            </div >
            <div className="bg-blue-300 w-2/3 p-2 flex flex-col">
                {/* flex-grow faz ocupar todo o espaço disponivel */}
                <div className='flex-grow'>
                    {!selectedUserId && (
                        <div className='font-semibold text-gray-500 flex items-center justify-center h-full'>selecione um contato</div>
                    )}
                    {!!selectedUserId && (
                        <div className='relative h-full'>
                            <div className='overflow-auto absolute inset-0'>
                                {messagesWithoutDuplicates.map((msg) => (
                                    <div key={msg._id} className={'pr-2 ' + (msg.sender === id ? 'text-right' : 'text-left')}>
                                        <div className={'text-left inline-block rounded p-2 my-2 text-sm ' + (msg.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-500')}>
                                            {msg.text}
                                            {msg.file && (
                                                <div className='flex align-middle gap-1'>
                                                    {/* msg.file grava o fileName no database */}
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                                        <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
                                                    </svg>
                                                    <a className='underline' target='_blank' href={axios.defaults.baseURL + '/uploads/' + msg.file}>
                                                        {msg.file}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={divUnderMsg}></div>
                            </div>

                        </div>
                    )}
                </div>
                {/* '!!' converte o valor para boolean, se estiver vazio é convertido para false. */}
                {!!selectedUserId && (
                    <form className='flex gap-2' onSubmit={sendMessage}>
                        <input type="text"
                            placeholder='digite sua mensagem'
                            className='bg-white border p-2 rounded flex-grow'
                            value={newMessageText}
                            onChange={(evt) => { setNewMessageText(evt.target.value) }}
                        />
                        <label className='cursor-pointer flex items-center'>
                            <input type="file" className='hidden' onChange={sendFile} />
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
                            </svg>
                        </label>
                        <button type='submit' className='p-2 bg-blue-500 rounded text-white'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>

                        </button>
                    </form>
                )}
            </div>
        </div >
    )
}
