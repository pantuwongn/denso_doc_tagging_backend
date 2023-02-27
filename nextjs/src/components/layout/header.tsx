import { useRouter } from 'next/router'
import { FC, useCallback } from 'react'
import { AiOutlineArrowLeft } from 'react-icons/ai'

interface IProps {
  title: string
  query?: string
  backable?: boolean
  backRoute?: string
}

const Header: FC<IProps> = ({ title, query, backable, backRoute }: IProps) => {
  const router = useRouter()

  const handleBackClick = useCallback(() => {
    if (backRoute) {
      router.replace({ pathname: backRoute, query })
    } else {
      router.back()
    }
  }, [backRoute, router, query])
  return (
    <>
      <div className="w-full flex justify-between items-center p-4 shadow shadow-zinc-500">
        <div className="flex items-center">
          { backable && <AiOutlineArrowLeft size={22} className='cursor-pointer mr-4' onClick={handleBackClick}/> }
          <div className="text-xl font-bold mr-4">{title}</div>
        </div>
      </div>
    </>
  )
}

export default Header