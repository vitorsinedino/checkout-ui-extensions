import { useEffect, useState } from 'react';
import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,
  InlineLayout,
  Checkbox,
  BlockStack,
  Text,
  Image,
  Pressable,
  Heading,
  BlockSpacer,
  useCartLines,
  useApplyCartLinesChange
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  'purchase.checkout.cart-line-list.render-after',
  () => <Extension />,
);

const variantId = 'gid://shopify/ProductVariant/44878197915888'

interface VariantData {
  title: String;
  price: {
      amount: String;
      currencyCode: String;
  }
  image?: {
      url: string;
      altText: string;
  }
  product: {
      title: string;
      featuredImage?: {
          url: string;
          altText: string
      }
  }
}

function Extension() {
  const { query } = useApi();

const [variantData, setVariant] = useState<null | VariantData>(null)
const [isSelected, setIsSelected] = useState(false)
const cartLines = useCartLines();
const cartLinesChange = useApplyCartLinesChange();

useEffect(() => {
    async function getVariantData() {
      const queryResult = await query<{ node: VariantData }>(`
        {
          node(id: "${variantId}") {
            ... on ProductVariant {
              title
              price {
                amount
                currencyCode
              }
              image{
                url
                altText
              }
              product{
                title
                featuredImage{
                    url
                    altText
                }
              }
            }
          }
        }
      `);
      if(queryResult.data){
        setVariant(queryResult.data.node)
      }
    }
  
    getVariantData();
  }, [variantId]); // Assuming variantId is a dependency that, when changed, should re-run this effect
  console.log(variantData);

  useEffect(() => {
    if(isSelected){
      cartLinesChange({
        type:"addCartLine",
        quantity: 1,
        merchandiseId: variantId
      })
    }else{
      const cartLineId = cartLines.find(
        (cartline) => cartline.merchandise.id === variantId
      )?.id

      if(cartLineId){
        cartLinesChange({
          type: "removeCartLine",
          id: cartLineId,
          quantity: 1,
        })
      }
    }
  }, [isSelected]);

  if(!variantData) return null;

  return (
    <>
    <Heading level={2} > Other Products</Heading>
    <BlockSpacer></BlockSpacer>
    <Pressable onPress={() => setIsSelected(!isSelected)}>
      <InlineLayout 
        blockAlignment={'center'}
        spacing={['base', 'base']}
        columns={['auto', 90, 'fill']}
      >
        <Checkbox
          checked = {isSelected} 
        />
        <Image source={variantData.image?.url || variantData.product.featuredImage?.url} />

        <BlockStack>
          <Text>
            {variantData.product.title} - {variantData.title}
          </Text>
          <Text>
            {variantData.price.amount} {variantData.price.currencyCode}
          </Text>
        </BlockStack>
  
      </InlineLayout>
    </Pressable>
    </>
    
  );
}