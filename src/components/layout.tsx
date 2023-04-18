// components/layout.js

import { ReactNode } from 'react'
import { Container } from '@chakra-ui/react'
interface Props {
  children: ReactNode
}

export default function Layout({children}: Props) {
  return (
    <>
      <Container maxWidth={["container.sm", "container.sm", "container.md", "container.lg", "container.xl"]} my={8}>{children}</Container>
    </>
  )
}