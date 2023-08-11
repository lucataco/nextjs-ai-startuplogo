import { useEffect, useState } from "react";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import buildspaceLogo from "../assets/catacolabs-logo.png";

const Home = () => {
  const maxRetries = 20;

  const [input, setInput] = useState("");
  const [img, setImg] = useState("");
  const [retry, setRetry] = useState(0);
  const [retryCount, setRetryCount] = useState(maxRetries);
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState("");

  const onChange = (event) => {
    setInput(event.target.value);
  };

  const generateAction = async () => {
    console.log("Generating...");

    if (isGenerating && retry === 0) return;

    setIsGenerating(true);

    // If this is a retry request, take away retryCount
    if (retry > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0;
        } else {
          return prevState - 1;
        }
      });

      setRetry(0);
    }

    // Add the fetch request
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg",
      },
      body: JSON.stringify({ input }),
    });

    const data = await response.json();

    // If model still loading, drop that retry time
    if (response.status === 503) {
      setRetry(data.estimated_time);
      return;
    }

    // If another error, drop error
    if (!response.ok) {
      console.log(`Error: ${data.error}`);
      setIsGenerating(false);
      return;
    }

    setFinalPrompt(input);
    setInput("");
    setImg(data.image);
    setIsGenerating(false);
  };

  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  useEffect(() => {
    const runRetry = async () => {
      if (retryCount === 0) {
        console.log(
          `Model still loading after ${maxRetries} retries. Try request again in 5 minutes.`
        );
        setRetryCount(maxRetries);
        return;
      }

      console.log(`Trying again in ${retry} seconds.`);

      await sleep(retry * 1000);

      await generateAction();
    };

    if (retry === 0) {
      return;
    }

    runRetry();
  }, [retry]);

  return (
    <div className="root">
      <Head>
        <title>AI Logo Generator | buildspace</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>AI Logo Generator</h1>
          </div>
          <div className="header-subtitle">
            <h2>
              Create your own Startup Logos. Make sure you use "startuplogo
              style" in the prompt.
            </h2>
            <p>Ex: a photo of a fox in startuplogo style, vector art (Huggingface server, may take up to 4min)</p>
          </div>
          <div className="prompt-container">
            <input
              className="prompt-box"
              value={input}
              onChange={onChange}
              placeholder="a photo of a fox in startuplogo style, vector art"
            />
            <div className="prompt-buttons">
              <a
                className={
                  isGenerating ? "generate-button loading" : "generate-button"
                }
                onClick={generateAction}
              >
                <div className="generate">
                  {isGenerating ? (
                    <span className="loader"></span>
                  ) : (
                    <p>Generate</p>
                  )}
                </div>
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <p>
              <i>Like my work? Send me a Taco!</i>
            </p>
            <Link href="https://buymeacoffee.com/lucataco" target="_blank">
              <Image
                width="220"
                height="60"
                src="/bmac.png"
                alt="Buy me a Coffee"
              />
            </Link>
          </div>
        </div>
        {/* Add output container */}
        {img && (
          <div className="output-content">
            <Image src={img} width={512} height={512} alt={input} />
            <p>{finalPrompt}</p>
          </div>
        )}
      </div>
      <div className="badge-container grow">
        <a
          href="https://catacolabs.com"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>Built by CatacoLabs</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
