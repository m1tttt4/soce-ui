import {
  parseMappingData,
  parsePriceData,
  parseProductData,
} from "@pythnetwork/client";
import { AccountInfo, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { getMultipleAccounts } from "../contexts/accounts";
import { useConnection } from "../contexts/connection";

const oraclePublicKey = "BmA9Z6FjioHJPpjT39QazZyhDRUdZy2ezwx4GiDdE2u2";

const BAD_SYMBOLS = ["BCH/USD", "LTC/USD"];

const createSetSymbolMapUpdater = (
  symbol: string,
  product: any,
  price: any
) => (prev: any) =>
  !prev[symbol] || prev[symbol].price["currentSlot"] < price.currentSlot
    ? {
        ...prev,
        [symbol]: {
          product,
          price,
        },
      }
    : prev;

const handlePriceInfo = (
  symbol: string,
  product: any,
  accountInfo: AccountInfo<Buffer> | null,
  setSymbolMap: Function
) => {
  if (!accountInfo || !accountInfo.data) return;
  const price = parsePriceData(accountInfo.data);
  if (price.priceType !== 1)
    console.log(symbol, price.priceType, price.nextPriceAccountKey);
  setSymbolMap(createSetSymbolMapUpdater(symbol, product, price));
};

interface ISymbolMap {
  [index: string]: object;
}

const usePyth = (symbolFilter?: Array<String>) => {
  const connection = useConnection();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState();
  const [numProducts, setNumProducts] = useState(0);
  const [symbolMap, setSymbolMap] = useState<ISymbolMap>({});
  useEffect(() => {
    let cancelled = false;
    const subscription_ids: number[] = [];
    (async () => {
      // read mapping account
      const publicKey = new PublicKey(oraclePublicKey);
      try {
        const accountInfo = await connection.getAccountInfo(publicKey);
        if (cancelled) return;
        if (!accountInfo || !accountInfo.data) {
          setIsLoading(false);
          return;
        }
        const {
          productAccountKeys,
          nextMappingAccount,
        } = parseMappingData(accountInfo.data);
        let allProductAccountKeys = [...productAccountKeys];
        let anotherMappingAccount = nextMappingAccount;
        while (anotherMappingAccount) {
          const accountInfo = await connection.getAccountInfo(
            anotherMappingAccount
          );
          if (cancelled) return;
          if (!accountInfo || !accountInfo.data) {
            anotherMappingAccount = null;
          } else {
            const { productAccountKeys, nextMappingAccount } = parseMappingData(
              accountInfo.data
            );
            allProductAccountKeys = [
              ...allProductAccountKeys,
              ...productAccountKeys,
            ];
            anotherMappingAccount = nextMappingAccount;
          }
        }
        setIsLoading(false);
        setNumProducts(productAccountKeys.length);
        const productsInfos = await getMultipleAccounts(
          connection,
          productAccountKeys.map((p) => p.toBase58()),
          "confirmed"
        );
        if (cancelled) return;
        const productsData = productsInfos.array.map((p) =>
          parseProductData(p.data)
        );
        const priceInfos = await getMultipleAccounts(
          connection,
          productsData.map((p) => p.priceAccountKey.toBase58()),
          "confirmed"
        );
        if (cancelled) return;
        for (let i = 0; i < productsInfos.keys.length; i++) {
          const productData = productsData[i];
          const product = productData.product;
          const symbol = product["symbol"];
          const priceAccountKey = productData.priceAccountKey;
          const priceInfo = priceInfos.array[i];

          // console.log(
            // `Product ${symbol} key: ${productKey} price: ${priceInfos.keys[i]}`
          // );

          if (
            (!symbolFilter || symbolFilter.includes(symbol)) &&
            !BAD_SYMBOLS.includes(symbol)
          ) {
            handlePriceInfo(symbol, product, priceInfo, setSymbolMap);

            subscription_ids.push(
              connection.onAccountChange(priceAccountKey, (accountInfo) => {
                handlePriceInfo(symbol, product, accountInfo, setSymbolMap);
              })
            );
          }
        }
      } catch (e) {
        if (cancelled) return;
        setError(e);
        setIsLoading(false);
        console.warn(
          `Failed to fetch mapping info for ${publicKey.toString()}`
        );
      }
    })();
    return () => {
      cancelled = true;
      for (const subscription_id of subscription_ids) {
        connection.removeAccountChangeListener(subscription_id).catch(() => {
          console.warn(
            `Unsuccessfully attempted to remove listener for subscription id ${subscription_id}`
          );
        });
      }
    };
  }, [connection, symbolFilter]);
  return { isLoading, error, numProducts, symbolMap };
};

export default usePyth;
