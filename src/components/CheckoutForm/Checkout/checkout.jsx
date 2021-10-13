import React, { useState, useEffect } from 'react'
import { Paper, Stepper, Step, Typography, StepLabel, CircularProgress, Divider, Button, CssBaseline } from '@material-ui/core';
import useStyles from './checkoutStyles';
import AddressForm from '../AddressForm';
import PaymentForm from '../PaymentForm';
import { commerce } from '../../../Library/commerce';
import { Link, useHistory } from 'react-router-dom';

const steps = ["Shipping Address", "Payment Details"]

const Checkout = ({cart, order, onCaptureCheckout, error}) => {
    const [activateStep, setActivateStep] = useState(0);
    const [checkoutToken, setCheckoutToken] = useState(null);
    const [shippingData, setShippingData] = useState({})
    const [isFinished, setIsFinished] = useState(false)
    const classes = useStyles();
    const history = useHistory();

    useEffect(() => {
        const generateToken = async () => {
            try {
                const token = await commerce.checkout.generateToken(cart.id, { type: 'cart' })
                setCheckoutToken(token)
            } catch (error) {
                history.pushState('/')
            }
        }
        generateToken();
    }, [cart])

    const test = (data) => {
        setShippingData(data);
        nextStep();
    }

    const timeout = () => {
        setTimeout(() => {
            setIsFinished(true)
        },3000)
    }

    const nextStep = () => setActivateStep((prevActiveStep) => prevActiveStep + 1);
    const backStep = () => setActivateStep((prevActiveStep) => prevActiveStep - 1);

    let Confirmation = () => order.customer ? (
        <>
            <div>
                <Typography variant="h5">
                    Thanks for purchasing, {order.customer.firstname} {order.customer.lastname}
                </Typography>
                <Divider className={classes.divider} />
                <Typography variant="subtitle2">
                    Order ref : {order.customer.reference}
                </Typography>
                <br />
                <Button component={Link} to="/" type="button" variant="outlined">Back to Home</Button>
            </div>
        </>
    ) : isFinished ? (
            <>
            <div>
                <Typography variant="h5">
                    Thanks for purchasing
                </Typography>
                <Divider className={classes.divider} />
                <Typography variant="subtitle2">
                    Order ref : {order.customer.reference}
                </Typography>
                <br />
                <Button component={Link} to="/" type="button" variant="outlined">Back to Home</Button>
            </div>
        </>
    ) : (
        <div className={classes.spinner}>
            <CircularProgress />
        </div>
    );

    if (error) {
        <>
            <Typography variant="h5">Error : {error}</Typography>
            <br />
            <Button component={Link} to="/" type="button" variant="outlined">Back to Home</Button>
        </>
    }

    const Form = () => activateStep === 0
        ? <AddressForm checkoutToken={checkoutToken} nextStep={nextStep} setShippingData={setShippingData} test={test} />
        : <PaymentForm checkoutToken={checkoutToken} shippingData={shippingData} nextStep={nextStep} backStep={backStep} onCaptureCheckout={onCaptureCheckout} timeout={timeout} />

    return (
        <>
            <CssBaseline />
            <div className={classes.toolbar} />
            <main className={classes.layout}>
                <Paper className={classes.paper}>
                    <Typography variant="h4" align="center">Checkout</Typography>
                    <Stepper activeStep={activateStep} className={classes.stepper}>
                        {steps.map((step) => (
                            <Step key={step}>
                                <StepLabel>{step}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    {activateStep === steps.length ? <Confirmation /> : checkoutToken && <Form />}
                </Paper>
            </main>
        </>
    )
}

export default Checkout;
