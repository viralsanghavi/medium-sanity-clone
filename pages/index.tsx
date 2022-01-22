import Head from "next/head";
import Banner from "../components/Banner/Banner";
import Header from "../components/Header/Header";
import Posts from "../components/Posts/Posts";
import {Post} from "../typings";
import {sanityClient} from "../sanity";

interface Props {
  posts: Post[];
}

export default function Home({posts}: Props) {
  return (
    <div className="max-w-7xl mx-auto">
      <Head>
        <title>Medium Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <Banner />
      <Posts posts={posts} />
    </div>
  );
}
export async function getServerSideProps() {
  const query = `*[_type=="post"]{
        _id,
      title,
        slug,
      author ->{
        name,
        image
      },
      description,
      mainImage
      }`;
  console.log("post");
  const posts = await sanityClient.fetch(query);
  return {
    props: {
      posts,
    },
  };
}
