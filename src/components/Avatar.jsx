

export default function Avatar({ username, userId, online }) {
    const colors = ['bg-red-200', 'bg-green-200', 'bg-purple-200', 'bg-blue-200', 'bg-yellow-200', 'bg-teal-200']
    //converte o Id para base 16, e divide por 6 e pega o resto, gerando um número único para aquele user.
    const colorIndex = parseInt(userId, 16) % colors.length
    const color = colors[colorIndex]
    console.log(color)
    return (
        <div className={"w-10 h-10 relative rounded-full flex items-center justify-center " + color}>
            <div className='opacity-80 w-full text-center'>
                {username}
            </div>
            {online && (
                <div className="absolute w-3 h-3 bg-green-500 bottom-0 right-0 rounded"></div>
            )}
            {!online && (
                <div className="absolute w-3 h-3 bg-gray-500 bottom-0 right-0 rounded"></div>
            )}
        </div>
    )
}
