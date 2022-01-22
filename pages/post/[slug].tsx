import {GetStaticPaths, GetStaticProps} from "next";
import Header from "../../components/Header/Header";
import {sanityClient, urlFor} from "../../sanity";
import {Post} from "../../typings";
import PortableText from "react-portable-text";
import {SubmitHandler, useForm} from "react-hook-form";
import {useState} from "react";

interface Props {
  post: Post;
  updatedAt: string;
}

interface IFormInput {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

function Post({post, updatedAt}: Props) {
  const [submitted, setSubmitted] = useState(false);
  const timeString = new Date(updatedAt).toLocaleTimeString();
  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm();

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    fetch("/api/createComment", {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then(() => {
        setSubmitted(true);
      })
      .catch((err) => {
        console.log(err);
        setSubmitted(true);
      });
  };
  return (
    <main>
      <Header />
      <p>{timeString}</p>
      <img
        src={urlFor(post?.mainImage).url()!}
        alt=""
        className="w-full h-60 object-cover"
      />
      <article className="max-w-3xl mx-auto p-5">
        <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
        <h2 className="text-xl font-light mb-2 text-gray-500">
          {post.description}
        </h2>
        <div className="flex items-center space-x-2">
          <img
            className="h-10 w-10 rounded-full"
            src={urlFor(post.author.image).url()!}
            alt=""
          />
          <p className="font-extralight text-sm">
            Blog post by{" "}
            <span className="text-green-600">{post.author.name}</span> -
            Published at {new Date(post._createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-10">
          <PortableText
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
            content={post.body}
            className=""
            serializers={{
              h1: (props: any) => {
                <h1 className="text-2xl font-bold my-5" {...props} />;
              },
              h2: (props: any) => {
                <h1 className="text-xl font-bold my-5" {...props} />;
              },
              li: ({children}: any) => {
                <li className="ml-4 list-disc">{children}</li>;
              },
              link: ({href, children}: any) => {
                <a href={href} className="text-blue-500 hover:underline">
                  {children}
                </a>;
              },
            }}
          />
        </div>
      </article>
      <hr className="max-w-lg my-5 mx-auto border border-yellow-500" />
      {submitted ? (
        <div className="flex flex-col p-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold">Thank you for Submiting</h3>
          <p>Once it has been approved, it will appear below</p>
        </div>
      ) : (
        <form
          className="flex flex-col p-5 max-w-2xl mx-auto mb-10 space-y-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h3 className="text-yellow-500 text-sm">Enoyed the article?</h3>
          <h4 className="text-4xl font-bold">Leave a comment below.</h4>
          <hr className="py-3 mt-2 font-extralight" />
          <input
            {...register("_id")}
            type="hidden"
            name="_id"
            value={post._id}
          />
          <label className="block mb-5">
            <span className="text-gray-700">Name</span>
            <input
              type="text"
              {...register("name", {required: true})}
              className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 
            focus:ring outline-none"
              placeholder="John Appleseed"
            />
          </label>
          <label className="block mb-5">
            <span className="text-gray-700">Email</span>
            <input
              type="email"
              {...register("email", {required: true})}
              className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 focus:ring outline-none"
              placeholder="abc@email.com"
            />
          </label>
          <label className="block mb-5">
            <span className="text-gray-700">Comment</span>
            <textarea
              {...register("comment", {required: true})}
              className="shadow border rounded py-2 px-3 form-textarea mt-1 block w-full ring-yellow-500 focus:ring outline-none"
              placeholder="John Appleseed"
              rows={8}
            />
          </label>
          <div className="flex flex-col p-5">
            {errors.name && (
              <span className="text-red-500">- The Name Field is Required</span>
            )}
            {errors.comment && (
              <span className="text-red-500">
                - The comment Field is Required
              </span>
            )}
            {errors.email && (
              <span className="text-red-500">
                - The Email Field is Required
              </span>
            )}
          </div>
          <input
            type="submit"
            className="shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold px-4 py-2 rounded cursor-pointer"
          />
        </form>
      )}
      <div className="flex flex-col p-10 my-10 max-w-2xl mx-auto shadow shadow-yellow-500 space-y-2">
        <h3 className="text-4xl">Comments</h3>
        <hr className="pb-2" />
        {post.comments.map((comment) => (
          <div key={comment._id}>
            <p>
              <span className="text-yellow-500">{comment.name}</span>:{" "}
              {comment.comment}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const query = `*[_type=="post"]{
          _id,
          slug{
              current
          },
        }`;

  const posts = await sanityClient.fetch(query);

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({params}) => {
  const query = `*[_type=="post" && slug.current == $slug][0]{
        _id,
        _createdAt,
        title,
        author->{
            name,image
        },
        description,
        mainImage,
        body,
'comments':*[
_type=='comment' && post._ref == ^._id
&& approved == true
],
        slug{
            current
        },
      }`;

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  });
  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
      updatedAt: Date.now(),
    },
    revalidate: 30,
  };
};

export default Post;
