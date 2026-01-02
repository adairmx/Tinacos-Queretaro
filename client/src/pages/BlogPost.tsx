// Código editado para eliminar workaround de pantalla en blanco
import React from "react";
import { useParams, useMatch } from "react-router-dom";
import NotFound from "../components/NotFound";
import posts from "../data/posts";

const BlogPost = () => {
  const params = useParams<{ slug: string }>();
  const match = useMatch("/blog/:slug");
  if (!params.slug) {
    return <NotFound />;
  }
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) {
    return <NotFound />;
  }
  return (
    <div>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
};

export default BlogPost;
