import { Text, FormLabel, Input, Button, VStack, Divider } from "@chakra-ui/react"
import { useState } from "react"
import Link from "next/link"

export default function Home() {
  const [id, setID] = useState('')
  const [name, setName] = useState('')
  return (
    <VStack>
      <Text as="b" fontSize={["xl", "2xl", "3xl", "4xl", "5xl"]}>Cards Against Humanity Online</Text>
      <Divider/>
      <FormLabel>Nickname to be used</FormLabel>
      <Input type='text' placeholder="NickName" value={name} onChange={(event) => setName(event.target.value)}/>
      <FormLabel>Enter Room ID to join a room</FormLabel>
      <Input type='text' placeholder="Room ID" value={id} onChange={(event) => setID(event.target.value)}/>
      <Button colorScheme='green' as={Link} href={`/room/${id}`} isDisabled={id.length < 4}>JOIN ROOM</Button>
      <FormLabel>OR Create one</FormLabel>
      <Button colorScheme='green'>CREATE ROOM</Button>
    </VStack>
  )
}
