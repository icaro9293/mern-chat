// import React from 'react'
import Avatar from './Avatar'

export default function Contatos({ id, username, onClick, selected, online }) {
    return (
        <div key={id} onClick={() => {
            onClick(id)
        }} className={'border-b border-gray-100 py-2 flex items-center gap-2 cursor-pointer rounded pl-2 ' + (id === selected ? 'bg-blue-300' : '')}>
            {id === selected && (
                <div className='bg-blue-500 h-14 w-3 absolute left-0 rounded-r-md'></div>
            )}
            <Avatar online={online} username={username} userId={id}></Avatar>
            <span className='font-semibold'>{username}</span>
        </div>
    )
}
