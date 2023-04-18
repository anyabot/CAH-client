import { ReactNode } from 'react'
import { Card, CardBody, Text } from '@chakra-ui/react'
interface Props {
  children: string,
  color: "black" | "white"
}

export default function CahCard({children,color}: Props) {
  const reverse = (color == "black") ? "white" : "black"
  function fontSize() {
    var x = children.length;
    switch (true) {
        case (x < 20):
            return "3xl"
            break;
        case (x < 50):
            return "2xl"
            break;
        case (x < 100):
            return "xl"
            break;
        default:
            return "ld"
            break;

    }
  }
  return (
    <>
      <Card width="200px" height="300px" bg={color} color={reverse} as="b">
        <CardBody><Text fontSize={fontSize()}>{children}</Text></CardBody>
      </Card>
    </>
  )
}