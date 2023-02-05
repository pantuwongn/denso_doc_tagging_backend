import { Spin } from 'antd'
import { FC } from 'react'
import Header from './header'
import { useLayoutStore } from '@/store/layout.store'

interface IProps {
  title: string
  backable?: boolean
  className?: string
  children?: React.ReactNode
}

const Container: FC<IProps> = ({ title, className, backable, children }: IProps) => {
  const { isLoading } = useLayoutStore()
  return (
    <Spin spinning={isLoading} size="large" style={{ top: '50%', transform: 'translateY(-50%)' }}>
      <Header title={title} backable={backable} />
      <div className="w-full overflow-y-auto overflow-x-hidden" style={{ height: "calc(100vh - 64px)" }}>
        <div className={`w-full h-full p-4 m-auto ${className}`}>
          {children}
        </div>
      </div>
    </Spin>
  )
}

export default Container
