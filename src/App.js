import React, { Component } from 'react'
import NodeRSA from 'node-rsa'
import axios from 'axios'
import QRCode from 'qrcode.react'
import './App.css'
import logo from './logo.svg'

import { keys } from './keys'

function buildCardHashQueryString ({
	card_number,
	card_holder_name,
	card_expiration_date,
	card_cvv
}) {
 return `card_number=${card_number}\
&card_holder_name=${card_holder_name}\
&card_expiration_date=${card_expiration_date}\
&card_cvv=${card_cvv}`
}

function generateCardHash ({ data }, queryString) {
	const key = new NodeRSA(data.public_key, {
		encryptionScheme: 'pkcs1'
	})
	const keyId = data.id
	const encrypted = key.encrypt(queryString, 'base64')
  const cardHash = `${keyId}_${encrypted}`
	return cardHash
}

function requestRSAKey () {
	return axios
		.get('https://api.pagar.me/1/transactions/card_hash_key', {
			params: {
				encryption_key: keys.EK,
			}
		})
}

class App extends Component {
  constructor (props) {
		super(props)
    console.log()
		this.state = {
			card: {
				card_number: '4111111111111111',
				card_holder_name: 'abc',
				card_expiration_date: '1225',
				card_cvv: '123',
			},
      QRCodeText: '',
      error: 'H',
		}
  }
  setCard (stateIndex, event) {
    this.setState({
			card: {
				[stateIndex]: event.target.value,
			},
		})
  }
  generateCardHashQR () {
		const queryString = buildCardHashQueryString(this.state.card)
		requestRSAKey()
			.then(response =>
				generateCardHash(response, queryString)
			)
			.then(card_hash => {
				this.setState({ QRCodeText: card_hash })
			})
	}
  render () {
    return (
      <div className="container">
        <div className="cardInfo">
          <input
            onChange={this.setCard.bind(this, 'card_number')}
            defaultValue={this.state.card.card_number}
          />
          <input
            onChange={this.setCard.bind(this, 'card_holder_name')}
            defaultValue={this.state.card.card_holder_name}
          />
          <input
            onChange={this.setCard.bind(this, 'card_expiration_date')}
            defaultValue={this.state.card.card_expiration_date}
          />
          <input
            onChange={this.setCard.bind(this, 'card_cvv')}
            defaultValue={this.state.card.card_cvv}
          />
          <input
            onChange={e => this.setState({ error: e.target.value })}
            defaultValue={this.state.error}
          />
          <button onClick={this.generateCardHashQR.bind(this)}>
            Gerar QR Code
          </button>
        </div>
        {this.state.QRCodeText &&
            <div style={{position: 'relative'}}>
              <QRCode
                value={this.state.QRCodeText}
                size={Math.min(window.innerWidth*0.8, window.innerHeight*0.8)}
                level={this.state.error}
                fgColor="#f26f21"
              />
              <img src={logo} style={{
                position: 'absolute',
                width: '30%',
                height: '30%',
                left: '35%',
                top: '35%',
                backgroundColor: 'white',
                padding: 5,
                borderRadius: 999
              }}/>
            </div>
        }
      </div>
    )
  }
}

export default App
