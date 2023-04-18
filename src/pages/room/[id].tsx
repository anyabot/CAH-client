import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'
import Error from 'next/error';
import CahCard from '@/components/card';
import { Card, CardHeader, Heading, CardBody, Tag, Text, Divider, Flex, Button, Box, useToast, Circle } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import Link from "next/link"
import cah from '../../../public/cah-all-compact.json'
import arrayShuffle from 'array-shuffle';

export default function Home() {
  const [started, setStarted] = useState("wait")
  const [hand, setHand] = useState<string[]>([])
  const [goal, setGoal] = useState({text: "", pick: 0})
  const [picked, setPicked] = useState<number[]>([])
  const [results, setResults] = useState<string[]>([])
  const router = useRouter()
  const toast = useToast()
  const id = router.query.id as string

  var white = cah["white"]
  var whitedeck = arrayShuffle(white);
  var black = cah["black"]
  var blackdeck = arrayShuffle(black);

  function handleClick(index: number) {
    if (picked.includes(index)) {
      let temp = picked.filter(e => e != index)
      console.log(temp)
      setPicked(temp)
    }
    else if (picked.length >= goal.pick) {
      toast({
        description: 'Cannot pick more cards.',
        status: 'error',
        isClosable: true,
      })
    }
    else {
      setPicked(old => [...old, index])
    }
  }
  function submit() {
    if (picked.length < goal.pick) {
      toast({
        description: 'You have to pick more cards.',
        status: 'error',
        isClosable: true,
      })
    }
    else {
      //submit to server here instead
      let temp: string[] = []
      let temp_string = goal.text
      picked.forEach(e => temp_string = temp_string.replace(/_/, hand[e]))
      temp.push(temp_string)
      setResults(temp)
      setHand(old => old.filter((e, index) => !picked.includes(index)))
      setStarted("finished")
    }
  }

  //Should be done by Server
  function initial_hand() {
    const temp:string[] = []
    for (let i = 0; i < 10 ; i++) {
      let curr = whitedeck.pop()
      curr ? temp.push(curr) : null
    }
    setHand(temp)
  }
  function new_round() {
    let curr = blackdeck.pop()
    curr ? setGoal(curr) : null
    const temp:string[] = []
    if (curr) {
      for (let i = 0; i < curr.pick - 1 ; i++) {
        let curr = whitedeck.pop()
        curr ? temp.push(curr) : null
      }
    }
    setHand(old => [...old, ...temp])
    setPicked([])
    setStarted("playing")
  }
  function startGame() {
    initial_hand()
    new_round()
  }
  if (!id) return <Error statusCode={404}/>
  else {
    return (
      <>
        <Button as={Link} href={`/`} leftIcon={<ArrowBackIcon />} colorScheme='blackAlpha' variant='solid' float="right">Leave Room</Button>
        <Text fontSize='xl'>Room ID: {id}</Text>
        <Divider my={8}/>
        {started == "wait" ? 
        <>
          <Card size="md">
            <CardHeader>
              <Heading size='md'> Current Users ( /10)</Heading>
            </CardHeader>
            <CardBody>
              <Tag size="lg">You</Tag>
            </CardBody>
          </Card>
          <Button colorScheme='red' variant='solid' onClick={startGame}>Start Game</Button>
        </> : null }
        {started == "playing" ? <>
          <Card size="md">
            <CardHeader>
              <Heading size='md'>Card to be completed (Pick {goal.pick})</Heading>
            </CardHeader>
            <Flex as={CardBody} flexWrap="wrap" justifyContent="center" gap="10px">
              <CahCard color='black'>{goal.text}</CahCard>
            </Flex>
          </Card>
          <Card size="md">
            <CardHeader>
              <Button colorScheme='red' variant='solid' float="right" onClick={submit}>Pick</Button>
              <Heading size='md'> Your Cards</Heading>
            </CardHeader>
            <Flex as={CardBody} flexWrap="wrap" justifyContent="center" gap="10px">
              {hand.map((e, index) => (<Box key={index} cursor="pointer" position="relative" onClick={() => handleClick(index)} top="0px">
                {picked.includes(index) ? <Circle size='40px' bg='purple.700' color='white' position="absolute" right="-10px" top="-10px" zIndex="1"> {picked.indexOf(index) + 1} </Circle> : null}
                <CahCard color='white'>{e}</CahCard>
              </Box>))}
            </Flex>
          </Card>
        </> : null }
        {started == "finished" ? <>
          <Card size="md">
            <CardHeader>
              <Heading size='md'>Results</Heading>
            </CardHeader>
            <Flex as={CardBody} flexWrap="wrap" justifyContent="center" gap="10px">
              {results.map((e, index) => <CahCard key={index} color='black'>{e}</CahCard>)}
            </Flex>
          </Card>
          <Button colorScheme='red' variant='solid' float="right" onClick={new_round}>Continue</Button>
          <Button colorScheme='red' variant='solid' float="right" onClick={startGame}>Restart</Button>
        </> : null }
      </>
    )
  }
}
