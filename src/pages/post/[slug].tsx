import Prismic from '@prismicio/client';
import { GetStaticPaths } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import React from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import Header from '../../components/Header';
import { ConvertToDate } from '../../helpers/Converts';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const amountWordsOfBody = post.data.content
    ? RichText.asText(
      post.data.content.reduce((acc, data) => [...acc, ...data.body], [])
    ).split(' ').length 
    : 0;

  const amountWordsOfHeading = post.data.content
    ? post.data.content.reduce((acc, data) => {
      if (data.heading) {
        return [...acc, ...data.heading.split(' ')];
      }

      return [...acc];
    }, []).length 
    : 0;

  const readingTime = Math.ceil(
    (amountWordsOfBody + amountWordsOfHeading) / 200
  );
  
  return (
    <>
      <Head>
        <title>Post | spacetraveling.</title>
      </Head>

      <Header/>

      <main>
        <img className={styles.banner} src={post.data.banner.url} alt="" />
        <div className={styles.container}>
          <div className={styles.post}>
            <h1>{post.data.title}</h1>
            <div className={styles.subtitle}>
              <span>
                <FiCalendar />
                {ConvertToDate(post.first_publication_date)}
              </span>
              <span>
                <FiUser />
                {post.data.author}
              </span>
              <span>
                <FiClock />
                {readingTime} min
              </span>
            </div>

            <div className={styles.postContent}>
              {post.data.content?.map(({ heading, body }) => (
                <div key={heading}>
                  {heading && <h2>{heading}</h2>}

                  <div
                    className={styles.postSection}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    { pageSize: 3 }
  );

  const paths = posts.results.map(result => {
    return {
      params: {
        slug: result.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async ({ req, params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), 
    {
      pageSize: 1,
      after: slug,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: response.data.banner,
      author: response.data.author,
      content: response.data.content || null,
    },
  };

  return {
    props: {
      post,
    },
    redirect: 60 * 30, // 30 minutes
  };
};
