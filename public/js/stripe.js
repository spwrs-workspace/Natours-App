/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51OjM5GSEttJtDWP6Peeic7Wh9Ku3iCsBOSkqjlSo6e0EVFl149M7M4gbYW33BbKfe6QXNJ7tFDnvHo4Gg04paQKX0062SgS8jP',
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios({
      method: 'GET',
      url: `/api/v1/booking/checkout-session/${tourId}`,
      // headers:{
      //   Authorization: `Bearer sk_test_51OjM5GSEttJtDWP6l3O6JzfV1W7L77T67P8aChdX2zF2nnImAx3uGIPEiFBrgSUTdHBGS7TAkvRWblGqIvnL97yx00zkCcNlUw`,
      // }
    });
    // console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
