import { Text, FormLabel, Input, Button, VStack, Divider, FormErrorMessage, FormControl } from "@chakra-ui/react"
import Head from "next/head"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import socketService from "../services/socket"
import roomService from "../services/room"
import { useToast } from "@chakra-ui/react"

export default function Home() {
  const [isCreating, setCreating] = useState(false);
  const [isJoining, setJoining] = useState(false);
  const [id, setID] = useState('')
  const [name, setName] = useState('')
  const router = useRouter()
  const toast = useToast()

  const joinRoom = async (id: string, name:string) => {
    const socket = socketService.socket;

    if (!socket) {
      toast({
        title: 'Connection Error.',
        description: "No connection to server",
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
      return;
    }

    setJoining(true);

    const roomId = await roomService
      .joinRoom(socket, id, name)
      .catch((err: string) => {
        toast({
          title: 'Joining Error.',
          description: err,
          status: 'error',
          duration: 9000,
          isClosable: true,
        })
      });
    if (roomId) {
      router.push(`/room/${id}`);
    }
    setJoining(false);
  };

  const createRoom = async (name:string) => {
    const socket = socketService.socket;

    if (!socket) {
      toast({
        title: 'Connection Error.',
        description: "No connection to server",
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
      return;
    }

    setCreating(true);

    const roomId = await roomService
      .createRoom(socket, name)
      .catch((err: string) => {
        toast({
          title: 'Creation Error.',
          description: err,
          status: 'error',
          duration: 9000,
          isClosable: true,
        })
      });
    if (roomId) {
      router.push(`/room/${roomId}`);
    }
    setCreating(false);
  };

  return (
    <>
      <Head>
        <title>Cards Against Humanity Online</title>
      </Head>
      <VStack>
        <Text as="b" fontSize={["xl", "2xl", "3xl", "4xl", "5xl"]}>Cards Against Humanity Online</Text>
        <Divider/>
        <FormControl as={VStack} isInvalid={((id && id.length != 6) || (name && (name.length < 2 || name.length > 10))) ? true : false}>
        <FormLabel>Nickname to be used</FormLabel>
        <Input type='text' placeholder="NickName" value={name} onChange={(event) => setName(event.target.value)}/>
        {(name && (name.length < 2 || name.length > 10)) ? <FormErrorMessage>Nickname must be between 2 and 10 characters.</FormErrorMessage> : null}
        <FormLabel>Enter the 6-character Room ID to join a room</FormLabel>
        <Input type='text' placeholder="Room ID" value={id} onChange={(event) => setID(event.target.value.toUpperCase())}/>
        {(id && id.length != 6) ? <FormErrorMessage>Room ID must be 6-character.</FormErrorMessage> : null}
        <Button colorScheme='green' isDisabled={id.length != 6 || (name.length < 2 || name.length > 10)} onClick={() => joinRoom(id, name)}>{isJoining ? "JOINING..." : "JOIN ROOM"}</Button>
        <FormLabel>OR Create one</FormLabel>
        <Button colorScheme='green' isDisabled={name.length < 2 || name.length > 10} onClick={() => createRoom(name)}>{isCreating ? "CREATING..." : "CREATE ROOM"}</Button>
        </FormControl>
      </VStack>
    </>
  )
}
