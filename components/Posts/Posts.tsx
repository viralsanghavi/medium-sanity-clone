import {Post} from "../../typings";
import {sanityClient, urlFor} from "../../sanity";
import Link from "next/link";

interface Props {
  posts: Post[];
}

export default function Posts({posts}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-2 md:p-6">
      {posts.map((post) => (
        <Link key={post._id} href={`/post/${post.slug.current}`}>
          <div className="group cursor-pointer border rounded-lg overflow-hidden">
            <img
              src={urlFor(post.mainImage).url()!}
              alt="Main Image"
              className="w-full object-cover h-60 group-hover:scale-105 transition-transform duration-200 ease-in-out"
            />
            <div className="flex justify-between bg-white p-5">
              <div>
                <p className="text-lg font-bold">{post.title}</p>
                <p className="text-xs">
                  {post.description} by {post.author.name}
                </p>
              </div>
              <img
                src={urlFor(post.author.image).url()!}
                className="h-12 w-12 rounded-full"
                alt="Author Image"
              />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
