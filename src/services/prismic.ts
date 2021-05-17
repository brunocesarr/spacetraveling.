import Prismic from '@prismicio/client';
import { DefaultClient } from '@prismicio/client/types/client';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RichText } from 'prismic-dom';
import { ConvertToDate } from '../helpers/Converts';
// import { Post } from '../types/Post';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

export function getPrismicClient(req?: unknown): DefaultClient {
  try {
    const prismic = Prismic.client(process.env.PRISMIC_API_ENDPOINT, {
      req,
      accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    });
    return prismic;
  } catch (error) {
    console.error('Error in get prismic client. Message: ', error.message);
    throw error;
  }
}

export async function getAllPosts(pageSize: number = 3): Promise<Post[]> {
  try {
    const prismic = getPrismicClient();

    const response = await prismic.query(
      [Prismic.Predicates.at('document.type', 'post')],
      {
        fetch: ['publication.title', 'publication.content'],
        pageSize,
      },
    );

    const posts: Post[] = response.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: ConvertToDate(post.first_publication_date),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }
      };
    });
    console.log('Aqui:', posts);

    return posts;
  } catch (error) {
    console.error('Error in get documents. Message: ', error.message);
    throw error;
  }
}

export async function getPostByUid(uid: string, req?: unknown) {
  try {
    const prismic = getPrismicClient(req);

    const response = await prismic.getByUID('post', uid, {});

    // console.log(JSON.stringify(response, null, 2));

    return {
      slug: uid,
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      bannerUrl: response.data.banner.url,
      content: response.data.group,
      publicationAt: format(
        parseISO(response.first_publication_date),
        "dd MMM yyyy', às' HH:mm",
        {
          locale: ptBR,
        },
      ),
      updatedAt: format(
        parseISO(response.last_publication_date),
        "dd MMM yyyy', às' HH:mm",
        {
          locale: ptBR,
        },
      ),
    };
  } catch (error) {
    console.error('Error in get documents. Message: ', error.message);
    throw error;
  }
}
