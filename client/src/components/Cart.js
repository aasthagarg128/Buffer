import { ThemeContext } from '@emotion/react'
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { productDelete, removeItem } from '../features/cart/cartSlice'

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

const Cart = () => {
  const navigate = useNavigate()
  var companyId = localStorage.getItem('companyId')
  const displayRazorpay = async () => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?')
      return
    }

    const data = await fetch(
      `http://localhost:5000/payment/razorpay/${companyId}`,
      {
        method: 'POST',
      },
    ).then((t) => t.json())

    console.log(data)

    const options = {
      key: 'rzp_test_LIBykHmf9U826c',
      currency: data.currency,
      amount: data.amount.toString(),
      order_id: data.id,
      name: 'Buffer',
      description: 'Thank you for nothing. Please give us some money',
      image:
        'https://imgs.search.brave.com/nnernw_s4TZNL9KCtjSc6I91juOVcsmFT4juxisRvxM/rs:fit:355:225:1/g:ce/aHR0cHM6Ly90c2Uz/Lm1tLmJpbmcubmV0/L3RoP2lkPU9JUC51/Mk0wWnppbVBKVFZ1/VEFKakhlOHFRSGFK/NCZwaWQ9QXBp',
      handler: function (response) {
        alert(response.razorpay_payment_id)
        alert(response.razorpay_order_id)
        alert(response.razorpay_signature)
      },
      prefill: {
        name: 'sarthak pant',
        email: 'sdfdsjfh2@ndsfdf.com',
        phone_number: '9899999999',
      },
    }

    const paymentObject = new window.Razorpay(options)
    paymentObject.open()
  }

  const [data, setData] = useState()
  let getData = useSelector((state) => state.cart.cart)

  const dispatch = useDispatch()

  const handleBuy = async () => {
    const products = { getData }
    console.log(data)
    try {
      for (var i = 0; i < data.length; ++i) {
        const previous = await axios.put(
          'http://localhost:5000/previousBuy/addChemical',
          {
            userid: companyId,
            products: {
              name: data[i].name,
              price: data[i].price,
              quantity: data[i].quantity,
            },
          },
        )
      }
    } catch (err) {
      console.log(err)
    } finally {
      displayRazorpay()

      setTimeout(async () => {
        dispatch(removeItem)
        const data = await axios.put('http://localhost:5000/cart/clearCart', {
          userId: companyId,
        })
        getData = data
        alert('Order Placed')
        navigate('/')
      }, '20000')
    }
  }

  useEffect(() => {
    setData(getData.products)
  }, [getData])

  return (
    <div>
      {data &&
        data.map((item) => (
          <Card sx={{ maxWidth: 345 }} key={item._id}>
            <CardMedia
              component="img"
              alt="green iguana"
              height="140"
              image="/static/images/cards/contemplative-reptile.jpg"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Lizard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lizards are a widespread group of squamate reptiles, with over
                6,000 species, ranging across all continents except Antarctica
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() => dispatch(productDelete({ item }))}
              >
                remove
              </Button>
              <Button size="small">Learn More</Button>
            </CardActions>
          </Card>
        ))}
      <Button size="large" onClick={() => handleBuy()}>
        BUY
      </Button>
    </div>
  )
}

export default Cart