import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';

const FeatureList = [
  {
    title: 'Mejores Prácticas',
    img: 'img/best-practices.png',
    description: (
      <>
        Guías alineadas con el AWS Well-Architected Framework para garantizar
        soluciones eficientes y seguras.
      </>
    ),
  },
  {
    title: 'Arquitecturas de Referencia',
    img: 'img/architecture.png',
    description: (
      <>
        Patrones de diseño probados para escalabilidad, alta disponibilidad
        y optimización de costes.
      </>
    ),
  },
  {
    title: 'Infraestructura como Código',
    img: 'img/iac.png',
    description: (
      <>
        Ejemplos prácticos y fragmentos de código para Terraform, AWS CDK
        y CloudFormation.
      </>
    ),
  },
];

function Feature({ img, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={useBaseUrl(img)} className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
