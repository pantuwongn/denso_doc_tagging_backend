import Head from "next/head";
import type { NextPage } from "next";
import Container from "@/components/layout";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <>
      <div>
        <Head>
          <title>Document Tagging</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
      </div>
      <Container
        title="Document Tagging"
        className="flex flex-col justify-center items-center"
      >
        <Link href="/document?1=">
          <div className="text-xl my-2 cursor-pointer animate__animated animate__fadeInUp">
            Search Document
          </div>
        </Link>
        <Link href="/upload-document">
          <div className="text-xl my-2 cursor-pointer animate__animated animate__fadeInUp">
            Upload Document
          </div>
        </Link>
        <Link href="/document-qr">
          <div className="text-xl my-2 cursor-pointer animate__animated animate__fadeInUp">
            QR Code Generator
          </div>
        </Link>
      </Container>
    </>
  );
};

export default Home;
