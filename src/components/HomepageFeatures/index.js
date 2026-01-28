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
        Servicios alineados con el AWS Well-Architected Framework para garantizar
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
        y optimización de costes, listos para implementar en tus proyectos.
      </>
    ),
  },
  {
    title: 'Infraestructura como Código',
    img: 'img/iac.png',
    description: (
      <>
        Nuestras implementaciones son soluciones IaC y podemos desplegarlas con
        Terraform, AWS CDK y CloudFormation.
      </>
    ),
  },
];

function Feature({ img, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className="text--center">
          <img src={useBaseUrl(img)} className={styles.featureSvg} alt={title} />
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3" style={{ marginTop: '1.5rem' }}>{title}</Heading>
          <p>{description}</p>
        </div>
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
