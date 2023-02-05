import { useRouter } from 'next/router'
import { FC } from 'react'
import { AiOutlineArrowLeft } from 'react-icons/ai'

interface IProps {
  title: string
  backable?: boolean
}

const Header: FC<IProps> = ({ title, backable }: IProps) => {
  const router = useRouter()

  return (
    <>
      <div className="w-full flex justify-between items-center p-4 shadow shadow-zinc-500">
        <div className="flex items-center">
          { backable && <AiOutlineArrowLeft size={22} className='cursor-pointer mr-4' onClick={() => router.back()}/> }
          <div className="text-xl font-bold mr-4">{title}</div>
        </div>
      </div>
    </>
  )
}

export default Header