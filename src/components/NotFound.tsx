import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

export const NotFound = () => {
  useEffect(() => {
    window.document.title = '页面不存在'
  })
  return (
    <Container>
      <Message>
        恭喜您成功找到一个我们还没有定义过的页面，您可以<Link to="/">点击这里</Link>回到首页
      </Message>
    </Container>
  )
}

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`
const Message = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #62646d;
`
