import { useEffect, useState } from "react";
import Head from "next/head"
import { useRouter } from "next/router";
import Error from "next/error";
import CahCard from "@/components/card";
import {
  Card,
  CardHeader,
  Heading,
  CardBody,
  Tag,
  Text,
  Divider,
  Flex,
  Button,
  Box,
  useToast,
  Circle,
  TagRightIcon,
  CardFooter,
  FormControl, 
  VStack,
  FormLabel, 
  Input,
  FormErrorMessage,
  Modal, 
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@chakra-ui/react";
import { ArrowBackIcon, CheckIcon } from "@chakra-ui/icons";
import Link from "next/link";
import socketService from "../../services/socket";
import roomService from "../../services/room";
import { Player } from "@/interface";
import cah from "../../../public/cah-all-compact.json";
import arrayShuffle from "array-shuffle";

export default function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [started, setStarted] = useState("waiting");
  const [hand, setHand] = useState<string[]>([]);
  const [goal, setGoal] = useState({ text: "", pick: 0 });
  const [picked, setPicked] = useState<number[]>([]);
  const [results, setResults] = useState<string[]>([]);
  const [name, setName] = useState('')
  const [refresh, setRefresh] = useState(false)
  const [error, setError] = useState(false);
  const [players, setPlayers] = useState<{ [key: string]: Player }>({});
  const [judge, setJudge] = useState("")
  const [winner, setWinner] = useState("")
  const [result, setResult] = useState("")

  const router = useRouter();
  const toast = useToast();
  const id = router.query.id as string;

  var white = cah["white"];
  var whitedeck = arrayShuffle(white);
  var black = cah["black"];
  var blackdeck = arrayShuffle(black);

  useEffect(() => {
    const socket = socketService.socket;
    if (!socket) {
      toast({
        title: "Connection Error.",
        description: "No connection to server",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      setError(true);
      return;
    }
    async function checkRoom() {
      const player_data = await roomService
        .checkRoom(socket!, router.query.id as string)
        .catch((err: string) => {
          if (err == "You have not joined this room") {
            setStarted("not_joined")
            onOpen()
            setError(false)
            return
          }
          else {
            toast({
              title: "Room Error.",
              description: err,
              status: "error",
              duration: 9000,
              isClosable: true,
            });
            router.push(`/`);
            setError(true);
            return;
          }
        });
    }
    if (router.query.id) {
      checkRoom();
      socket!.on("room_data", (msg: { players: { [key: string]: Player } }) => {
        setPlayers(msg.players);
      });
      socket!.on(
        "game_start",
        (msg: {
          players: { [key: string]: Player };
          judge: string;
          blackCard: {
            text: string;
            pick: number;
          };
        }) => {
          setPlayers(msg.players);
          setGoal(msg.blackCard);
          setJudge(msg.judge);
          msg.players[socket.id].hand ? setHand(msg.players[socket.id].hand!) : null
          setWinner("")
          setResult("")
          setStarted("playing");
        }
      );
      socket!.on("game_judge", (msg: { players: { [key: string]: Player } }) => {
        setStarted("judging");
        setPlayers(msg.players);
      });
      socket!.on("winner", (msg: { players: { [key: string]: Player }, winner:string, result: string }) => {
        setStarted("waiting");
        setPlayers(msg.players);
        setWinner(msg.winner);
        setResult(msg.result);
        setJudge("")
      });
    }
  }, [router.query.id, router, toast, refresh]);

  function handleClick(index: number) {
    if (picked.includes(index)) {
      let temp = picked.filter((e) => e != index);
      setPicked(temp);
    } else if (picked.length >= goal.pick) {
      toast({
        description: "Cannot pick more cards.",
        status: "error",
        isClosable: true,
      });
    } else {
      setPicked((old) => [...old, index]);
    }
  }

  function submit() {
    if (picked.length < goal.pick) {
      toast({
        description: "You have to pick more cards.",
        status: "error",
        isClosable: true,
      });
    } else {
      let temp: string[] = [];
      let temp_string = goal.text;
      picked.forEach((e) => (temp_string = temp_string.replace(/_/, hand[e])));
      const socket = socketService.socket;
      socket?.emit("submit", { roomId: id, picked: picked });
      setPicked([])
    }
  }

  function submit_winner() {
    if (picked.length != goal.pick) {
      toast({
        description: "You have to pick a winner.",
        status: "error",
        isClosable: true,
      });
    } else {
      const socket = socketService.socket;
      let winner = Object.keys(players)[picked[0]]
      socket?.emit("submit_winner", { roomId: id, winner: winner });
      setPicked([])
    }
  }
  async function join(name:string) {
    const socket = socketService.socket;
    if (socket) {
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
        setRefresh(true)
        setStarted("waiting")
      }
    }

  }

  async function ready() {
    const socket = socketService.socket;
    socket?.emit("ready", { roomId: id });
  }

  async function leave() {
    const socket = socketService.socket;
    socket?.emit("leave", { roomId: id });
  }

  if (!id) return (
    <>
      <Head>
        <title>Loading</title>
      </Head>
      <h1>Loading</h1>
    </>
  );
  else {
    return error ? null : ((started == "not_joined") ? (
      <>
      <Head>
        <title>{"Joining Room: " + id}</title>
      </Head>
      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nickname to be used</ModalHeader>
          <ModalBody>
          <FormControl as={VStack} isInvalid={((name && (name.length < 2 || name.length > 10))) ? true : false}>
      <FormLabel></FormLabel>
      <Input type='text' placeholder="NickName" value={name} onChange={(event) => setName(event.target.value)}/>
      {(name && (name.length < 2 || name.length > 10)) ? <FormErrorMessage>Nickname must be between 2 and 10 characters.</FormErrorMessage> : null}

      </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={async () => {await join(name)}}>
              Join
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>

    ) : (
      <>
        <Head>
          <title>{"Room: " + id}</title>
        </Head>
        <Button
          as={Link}
          href={`/`}
          leftIcon={<ArrowBackIcon />}
          colorScheme="blackAlpha"
          variant="solid"
          float="right"
          onClick={leave}
        >
          Leave Room
        </Button>
        <Text fontSize="xl">Room ID: {id}</Text>
        <Divider my={8} />
        <Card size="md">
          <CardHeader>
            <Heading size="md">
              {" "}
              Current Users ({Object.keys(players).length}/10)
            </Heading>
          </CardHeader>
          <CardBody>
            {Object.keys(players).map((player) => (
              <Tag size="lg" key={player} mx={1}>
                {players[player].name}{" "}
                {player == socketService?.socket?.id ? "(You)" : null}
                {player == judge ? "(Judge)" : null}
                {(players[player].ready == "ready" || players[player].ready == "playing_ready") ? (
                  <TagRightIcon as={CheckIcon} />
                ) : null}
              </Tag>
            ))}
          </CardBody>
          {started == "waiting" ? (<CardFooter><Text m={2}>{"The game will start when all players (min 3) are ready."}</Text></CardFooter>) : null}
        </Card>
        <Divider my={8} />
        {started == "waiting" ? (
          <>
            <Button colorScheme="red" variant="solid" onClick={ready}>
              Ready
            </Button>
          </>
        ) : null}
        {winner.length > 0 ? <>
            <Card size="md">
              <CardHeader>
                <Heading size="md">The Winner is: {winner}</Heading>
              </CardHeader>
              <Flex
                as={CardBody}
                flexWrap="wrap"
                justifyContent="center"
                gap="10px"
              >
                  <CahCard color="black">
                    {result}
                  </CahCard>
              </Flex>
            </Card>
          </>: null}
        {started == "playing" ? (
          <>
            <Card size="md">
              <CardHeader>
                <Heading size="md">
                  Card to be completed (Pick {goal.pick})
                </Heading>
              </CardHeader>
              <Flex
                as={CardBody}
                flexWrap="wrap"
                justifyContent="center"
                gap="10px"
              >
                <CahCard color="black">{goal.text}</CahCard>
              </Flex>
            </Card>
            <Card size="md">
              {socketService?.socket?.id != judge ? 
            <>
              <CardHeader>
                <Button
                  colorScheme="red"
                  variant="solid"
                  float="right"
                  onClick={submit}
                >
                  Pick
                </Button>
                <Heading size="md"> Your Cards</Heading>
              </CardHeader>
              <Flex
                as={CardBody}
                flexWrap="wrap"
                justifyContent="center"
                gap="10px"
              >
                {hand.map((e, index) => (
                  <Box
                    key={index}
                    cursor="pointer"
                    position="relative"
                    onClick={() => handleClick(index)}
                    top="0px"
                  >
                    {picked.includes(index) ? (
                      <Circle
                        size="40px"
                        bg="purple.700"
                        color="white"
                        position="absolute"
                        right="-10px"
                        top="-10px"
                        zIndex="1"
                      >
                        {" "}
                        {picked.indexOf(index) + 1}{" "}
                      </Circle>
                    ) : null}
                    <CahCard color="white">{e}</CahCard>
                  </Box>
                ))}
              </Flex>
            </> : <Text m={2}>You are the Judge, please wait for other players to finish</Text> 
            }
            </Card>
          </>
        ) : null}
        {started == "judging" ? (
          <>
          <Card size="md">
            {socketService?.socket?.id == judge ? 
          <>
            <CardHeader>
              <Button
                colorScheme="red"
                variant="solid"
                float="right"
                onClick={submit_winner}
              >
                Pick Winner
              </Button>
              <Heading size="md"> Results</Heading>
            </CardHeader>
            <Flex
              as={CardBody}
              flexWrap="wrap"
              justifyContent="center"
              gap="10px"
            >
              {Object.keys(players).map((e, index) => e != judge ?(
                <Box
                  key={index}
                  cursor="pointer"
                  position="relative"
                  onClick={() => setPicked([index])}
                  top="0px"
                >
                  {picked.includes(index) ? (
                    <Circle
                      size="40px"
                      bg="purple.700"
                      color="white"
                      position="absolute"
                      right="-10px"
                      top="-10px"
                      zIndex="1"
                    >
                      {" "}
                      {picked.indexOf(index) + 1}{" "}
                    </Circle>
                  ) : null}
                  <CahCard color="black">{players[e].result!}</CahCard>
                </Box>
              ) : null )}
            </Flex>
          </> : <>
            <CardHeader>
              <Heading size="md"> {"Results (Waiting for the Judge to Pick the Winner)"}</Heading>
            </CardHeader>
            <Flex
              as={CardBody}
              flexWrap="wrap"
              justifyContent="center"
              gap="10px"
            >
              {Object.keys(players).map((e, index) => e != judge ? (
                <Box
                  key={index}
                  position="relative"
                  top="0px"
                >
                  <CahCard color="black">{players[e].result!}</CahCard>
                </Box>
              ) : null )}
            </Flex>
          </> 
          }
          </Card>
        </>
        ) : null}
      </>
    ))
  }
}
