"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import styles from './PokemonMemoryGame.module.css'

type Pokemon = {
  id: number
  name: string
  image: string
}

type Card = Pokemon & {
  isFlipped: boolean
  isMatched: boolean
}

export default function PokemonMemoryGame() {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [moves, setMoves] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPokemonData()
  }, [])

  const fetchPokemonData = async () => {
    try {
      setIsLoading(true)
      const pokemonIds = Array.from({ length: 10 }, () => Math.floor(Math.random() * 151) + 1)
      const pokemonData = await Promise.all(
        pokemonIds.map(async (id) => {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
          const data = await response.json()
          return {
            id: data.id,
            name: data.name,
            image: data.sprites.front_default,
          }
        })
      )

      const gameCards = [...pokemonData, ...pokemonData]
        .sort(() => Math.random() - 0.5)
        .map((pokemon) => ({
          ...pokemon,
          isFlipped: false,
          isMatched: false,
        }))

      setCards(gameCards)
    } catch (error) {
      console.error("Failed to fetch Pokemon data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardClick = (clickedCard: Card , indexOfCard: number) => {
    if (flippedCards.length === 2 || clickedCard.isFlipped || clickedCard.isMatched) return

    const newCards = cards.map((card,index) =>
    index === indexOfCard ? { ...card, isFlipped: true } : card
    )

    const updatedFlippedCards = [...flippedCards, clickedCard.id]

    setCards(newCards)
    setFlippedCards(updatedFlippedCards)

    if (updatedFlippedCards.length === 2) {
      const [firstCardId, secondCardId] = updatedFlippedCards
      const firstCard = newCards.find((card) => card.id === firstCardId)
      const secondCard = newCards.find((card) => card.id === secondCardId)

      if (firstCard && secondCard && firstCard.id === secondCard.id) {
        setCards(
          newCards.map((card) =>
            card.id === firstCardId || card.id === secondCardId ? { ...card, isMatched: true } : card
          )
        )
        setMatchedPairs(matchedPairs + 1)
        setFlippedCards([])
      } else {
        setTimeout(() => {
          setCards(
            newCards.map((card) =>
              card.id === firstCardId || card.id === secondCardId ? { ...card, isFlipped: false } : card
            )
          )
          setFlippedCards([])
        }, 1000)
      }
      setMoves(moves + 1)
    }
  }

  const resetGame = () => {
    setCards(cards.map((card) => ({ ...card, isFlipped: false, isMatched: false })).sort(() => Math.random() - 0.5))
    setFlippedCards([])
    setMatchedPairs(0)
    setMoves(0)
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pokemon Memory Game</h1>
      <div className={styles.gameBoard}>
        {cards.map((card,index) => (
          <div
            key={`${card.id}-${card.name}-${index}`}
            className={`${styles.card} ${card.isFlipped ? styles.flipped : ''} ${
              card.isMatched ? styles.matched : ''
            }`}
            onClick={() => handleCardClick(card , index)}
          >
            <div className={styles.cardInner}>
              <div className={styles.cardFront}>
                <Image src="/pokeball.svg" alt="Pokeball" width={65} height={65} />
              </div>
              <div className={styles.cardBack}>
                <Image src={card.image} alt={card.name} width={65} height={65} />
                <span className={styles.pokemonName}>{card.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.gameInfo}>
        <p>Moves: {moves}</p>
        <p>Matched: {matchedPairs} / 8</p>
        <button onClick={resetGame} className={styles.resetButton}>
          Reset Game
        </button>
      </div>
    </div>
  )
}