import React, { useState, useMemo } from 'react';
import {
  Flame,
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Sparkles,
  Heart,
  Droplets,
  Church,
  Compass,
  Send,
  CheckCircle2,
  Share2,
  Printer,
  Shield,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface FaithFaqPageProps {
  onNavigate: (page: string, param?: string) => void;
  onOpenDonate?: (cause?: string) => void;
}

interface FaqItem {
  id: string;
  category: string;
  question: string;
  shortAnswer: string;
  detailedAnswer: string[];
  scriptures: { ref: string; text: string }[];
  popular?: boolean;
}

const FAITH_CATEGORIES = [
  'All',
  'Holy Spirit & Tongues',
  'Salvation & Grace',
  'Water Baptism & Communion',
  'Divine Healing & Miracles',
  'Praise & Worship',
  'Sanctification & Holy Living',
  'End Times & Tribal Missions'
];

const FAQ_DATA: FaqItem[] = [
  // Holy Spirit & Tongues
  {
    id: 'spirit-baptism',
    category: 'Holy Spirit & Tongues',
    popular: true,
    question: 'What is the Baptism in the Holy Spirit according to Pentecostal doctrine?',
    shortAnswer: 'A distinct, empowered spiritual experience following salvation where believers are filled with divine power from on high for victorious living, holiness, and bold ministry witness.',
    detailedAnswer: [
      'In classic Pentecostal theology, the Baptism in the Holy Spirit is an encounter distinct from and subsequent to the new birth (regeneration). While every believer receives the indwelling Holy Spirit upon placing faith in Christ (Romans 8:9), the Spirit baptism is an overflowing immersion of the believer in divine power.',
      'Jesus commanded His disciples not to leave Jerusalem until they received "the Promise of the Father" (Acts 1:4-5), saying: "You will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, in Judea and Samaria, and to the ends of the earth" (Acts 1:8).',
      'At Sacred Assemblies Fellowship Church in Godda, we earnestly pray and seek the outpouring of the Holy Spirit on every believer, youth, and elder so that our lives manifest Christ’s supernatural love and power.'
    ],
    scriptures: [
      { ref: 'Acts 1:8', text: '"But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth."' },
      { ref: 'Acts 2:1-4', text: '"All of them were filled with the Holy Spirit and began to speak in other tongues as the Spirit enabled them."' },
      { ref: 'Luke 24:49', text: '"I am going to send you what my Father has promised; but stay in the city until you have been clothed with power from on high."' }
    ]
  },
  {
    id: 'speaking-in-tongues',
    category: 'Holy Spirit & Tongues',
    popular: true,
    question: 'Why do Pentecostals speak in tongues, and what is its biblical purpose?',
    shortAnswer: 'Speaking in tongues serves as the initial physical sign of Holy Spirit baptism, an intimate personal prayer language for spiritual edification, and a congregational gift when accompanied by interpretation.',
    detailedAnswer: [
      'The Book of Acts records that whenever believers were first baptized in the Holy Spirit, they spoke in other tongues as the Spirit gave them utterance (Acts 2:4, Acts 10:44-46, Acts 19:6). Pentecostal churches recognize this as the initial physical evidence of Holy Spirit baptism.',
      'Beyond the initial sign, Scripture outlines two primary dimensions of tongues:',
      '1. Personal Prayer Language: Praying in the Spirit (glossolalia) allows the believer\'s spirit to pray mysteries directly to God beyond the limitations of human vocabulary, building up one\'s inner spiritual strength (1 Corinthians 14:2, 4, 14; Jude 20).',
      '2. Public Gift in Assembly: In a gathered worship service, when the Holy Spirit gives a public message in tongues, it must be paired with the gift of interpretation so that the whole congregation may be instructed, comforted, and edified (1 Corinthians 14:26-28).'
    ],
    scriptures: [
      { ref: '1 Corinthians 14:2', text: '"For anyone who speaks in a tongue does not speak to people but to God. Indeed, no one understands them; they utter mysteries by the Spirit."' },
      { ref: '1 Corinthians 14:4', text: '"Anyone who speaks in a tongue edifies themselves, but the one who prophesies edifies the church."' },
      { ref: 'Romans 8:26', text: '"In the same way, the Spirit helps us in our weakness. We do not know what we ought to pray for, but the Spirit himself intercedes for us through wordless groans."' }
    ]
  },
  {
    id: 'spiritual-gifts-today',
    category: 'Holy Spirit & Tongues',
    popular: true,
    question: 'Are the nine spiritual gifts (prophecy, healing, miracles, etc.) active today or did they cease with the Apostles?',
    shortAnswer: 'Pentecostals are continuationists. We firmly believe all nine gifts of 1 Corinthians 12 remain completely active, necessary, and distributed by the Holy Spirit today.',
    detailedAnswer: [
      'Unlike cessationist views, Pentecostal faith affirms that Jesus Christ is "the same yesterday, today, and forever" (Hebrews 13:8). The New Testament contains no scripture indicating that the supernatural charismata would vanish before Christ\'s Second Coming.',
      'Paul wrote: "Now to each one the manifestation of the Spirit is given for the common good" (1 Corinthians 12:7). These gifts encompass:',
      '• Revelation Gifts: Word of Wisdom, Word of Knowledge, Discerning of Spirits.',
      '• Power Gifts: Faith, Gifts of Healing, Working of Miracles.',
      '• Utterance Gifts: Prophecy, Diverse Tongues, Interpretation of Tongues.',
      'In our village crusades and church services across Jharkhand, we witness the Holy Spirit imparting these gifts decently and in order to deliver captives, comfort brokenhearted souls, and draw villagers into living faith in Jesus.'
    ],
    scriptures: [
      { ref: '1 Corinthians 12:7-11', text: '"All these are the work of one and the same Spirit, and he distributes them to each one, just as he determines."' },
      { ref: 'Hebrews 13:8', text: '"Jesus Christ is the same yesterday and today and forever."' },
      { ref: '1 Corinthians 14:1', text: '"Follow the way of love and eagerly desire gifts of the Spirit, especially prophecy."' }
    ]
  },

  // Salvation & Grace
  {
    id: 'salvation-by-grace',
    category: 'Salvation & Grace',
    popular: true,
    question: 'How is a person saved according to Pentecostal teaching?',
    shortAnswer: 'Salvation is solely by the grace of God through personal faith in Jesus Christ, received through sincere repentance of sin and confessing Jesus as Lord and Savior.',
    detailedAnswer: [
      'We affirm that human beings are separated from God by sin and completely incapable of saving themselves through good deeds, rituals, ancestral customs, or moral efforts.',
      'Salvation is a free gift purchased by the atoning sacrifice and shed blood of Jesus Christ on Calvary. When a person hears the Gospel, experiences conviction by the Holy Spirit, repents of sin, and places personal faith in Jesus Christ, they are regenerated, justified, and adopted into God’s royal family.',
      'Good works do not earn salvation; rather, good works are the natural fruit and evidence of genuine salvation.'
    ],
    scriptures: [
      { ref: 'Ephesians 2:8-9', text: '"For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast."' },
      { ref: 'Romans 10:9-10', text: '"If you declare with your mouth, \'Jesus is Lord,\' and believe in your heart that God raised him from the dead, you will be saved."' },
      { ref: 'Titus 3:5', text: '"He saved us, not because of righteous things we had done, but because of his mercy. He saved us through the washing of rebirth and renewal by the Holy Spirit."' }
    ]
  },
  {
    id: 'trinity-doctrine',
    category: 'Salvation & Grace',
    question: 'What do Pentecostals believe about the Holy Trinity and Jesus Christ?',
    shortAnswer: 'We confess one eternal God existing in three distinct, co-equal persons: the Father, the Son, and the Holy Spirit.',
    detailedAnswer: [
      'Mainstream classical Pentecostals adhere strictly to the historic Christian doctrine of the Trinity. There is one living and true God, infinite in holiness, wisdom, and power, eternally manifested in three persons: God the Father, God the Son, and God the Holy Spirit.',
      'Jesus Christ is fully God and fully man, conceived by the Holy Spirit and born of the Virgin Mary. He lived a sinless life, died vicariously for our sins, rose bodily from the grave on the third day, ascended to the right hand of the Father, and will return in glory.'
    ],
    scriptures: [
      { ref: 'Matthew 28:19', text: '"Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit."' },
      { ref: '2 Corinthians 13:14', text: '"May the grace of the Lord Jesus Christ, and the love of God, and the fellowship of the Holy Spirit be with you all."' },
      { ref: 'John 1:1, 14', text: '"In the beginning was the Word, and the Word was with God, and the Word was God... The Word became flesh and made his dwelling among us."' }
    ]
  },

  // Water Baptism & Communion
  {
    id: 'water-baptism',
    category: 'Water Baptism & Communion',
    question: 'Why do Pentecostals practice water baptism by full immersion?',
    shortAnswer: 'Water baptism by full immersion reflects the biblical pattern symbolizing dying to one’s old sinful life and rising out of the water to walk in new resurrected life with Christ.',
    detailedAnswer: [
      'Following genuine repentance and personal confession of faith in Christ, believers are commanded by Jesus to be baptized in water in the name of the Father, the Son, and the Holy Spirit (Matthew 28:19).',
      'The Greek word "baptizo" literally means to immerse, plunge, or submerge. Immersion beautifully pictures the believer’s union with Jesus: buried with Him through baptism into death, and resurrected to walk in newness of life (Romans 6:4).',
      'Because faith and repentance must precede baptism, Pentecostals do not practice infant christening; instead, infants and children are dedicated to the Lord, and individuals are baptized upon their own voluntary confession of faith.'
    ],
    scriptures: [
      { ref: 'Romans 6:3-4', text: '"Or don\'t you know that all of us who were baptized into Christ Jesus were baptized into his death? We were therefore buried with him through baptism into death in order that, just as Christ was raised from the dead through the glory of the Father, we too may live a new life."' },
      { ref: 'Acts 8:36-38', text: '"As they traveled along the road, they came to some water and the eunuch said, \'Look, here is water. What can stand in the way of my being baptized?\'... and Philip baptized him."' }
    ]
  },
  {
    id: 'holy-communion',
    category: 'Water Baptism & Communion',
    question: 'What is the significance of the Lord\'s Supper (Holy Communion)?',
    shortAnswer: 'A sacred ordinance commanded by Jesus Christ consisting of bread and fruit of the vine, commemorating His broken body and shed blood until He returns.',
    detailedAnswer: [
      'The Lord\'s Supper is an ordinance of remembrance, proclamation, and communion with the living Christ. The bread represents His body given for us, and the cup represents His shed blood establishing the New Covenant.',
      'We observe Communion with reverent self-examination, gratitude for the forgiveness of sins, joyful celebration of our covenant union with the body of Christ, and anticipation of the Marriage Supper of the Lamb at His Second Coming.'
    ],
    scriptures: [
      { ref: '1 Corinthians 11:23-26', text: '"For whenever you eat this bread and drink this cup, you proclaim the Lord\'s death until he comes."' },
      { ref: 'Luke 22:19-20', text: '"And he took bread, gave thanks and broke it, and gave it to them, saying, \'This is my body given for you; do this in remembrance of me.\'"' }
    ]
  },

  // Divine Healing & Miracles
  {
    id: 'divine-healing',
    category: 'Divine Healing & Miracles',
    popular: true,
    question: 'What is the Pentecostal view of Divine Healing?',
    shortAnswer: 'Divine healing is an integral part of the Gospel provided in Christ’s Atonement. The Lord heals physical sickness in answer to believing prayer, the laying on of hands, and anointing with oil.',
    detailedAnswer: [
      'The Prophet Isaiah declared: "Surely he took up our pain and bore our suffering... and by his wounds we are healed" (Isaiah 53:4-5), a passage Matthew explicitly quotes in the context of Jesus healing all who were sick (Matthew 8:16-17).',
      'We believe God is our Jehovah Rapha ("The Lord Who Heals You" - Exodus 15:26). In obedience to James 5:14-15, our elders and pastors regularly pray for the sick, anoint them with oil in the name of the Lord, and believe for divine recovery.',
      'Does this mean we oppose medical doctors or hospital medicine? Absolutely not. We thank God for medicine and trained doctors as instruments of natural healing, while acknowledging Jesus as the ultimate sovereign source of all life and recovery.'
    ],
    scriptures: [
      { ref: 'Isaiah 53:4-5', text: '"Surely he took up our pain and bore our suffering, yet we considered him punished by God, stricken by him, and afflicted... and by his wounds we are healed."' },
      { ref: 'James 5:14-15', text: '"Is anyone among you sick? Let them call the elders of the church to pray over them and anoint them with oil in the name of the Lord. And the prayer offered in faith will make the sick person well; the Lord will raise them up."' },
      { ref: '1 Peter 2:24', text: '"He himself bore our sins in his body on the cross, so that we might die to sins and live for righteousness; by his wounds you have been healed."' }
    ]
  },
  {
    id: 'deliverance-warfare',
    category: 'Divine Healing & Miracles',
    question: 'How do Pentecostals approach spiritual warfare and deliverance?',
    shortAnswer: 'Through the authority of the name of Jesus and the power of the Holy Spirit, believers are equipped to break demonic bondage, cancel witchcraft curses, and set captives free.',
    detailedAnswer: [
      'In tribal regions such as Jharkhand and across rural India, many souls suffer under fear of evil spirits, occult practices, and ancestral sorcery. Jesus gave His disciples power over unclean spirits (Mark 16:17, Luke 10:19).',
      'Pentecostals do not fear demonic forces because "the one who is in you is greater than the one who is in the world" (1 John 4:4). We conduct deliverance ministry with fasting, prayer, declaring the Word of God, and relying upon the blood of Jesus to bring genuine, lasting spiritual freedom.'
    ],
    scriptures: [
      { ref: 'Mark 16:17', text: '"And these signs will accompany those who believe: In my name they will drive out demons; they will speak in new tongues..."' },
      { ref: 'Ephesians 6:12', text: '"For our struggle is not against flesh and blood, but against the rulers, against the authorities, against the powers of this dark world and against the spiritual forces of evil in the heavenly realms."' },
      { ref: '2 Corinthians 10:4', text: '"The weapons we fight with are not the weapons of the world. On the contrary, they have divine power to demolish strongholds."' }
    ]
  },

  // Praise & Worship
  {
    id: 'expressive-worship',
    category: 'Praise & Worship',
    popular: true,
    question: 'Why is Pentecostal worship so vibrant and expressive with raised hands, instruments, and corporate prayer?',
    shortAnswer: 'Biblical worship involves the entire person—spirit, soul, voice, and body—expressing heartfelt gratitude, adoration, and freedom before the Lord.',
    detailedAnswer: [
      'In Pentecostal congregations, worship is not a passive spectator routine; it is an active, Spirit-led encounter with the King of Kings. Each physical expression is grounded in Scripture:',
      '• Lifting Hands: An ancient posture of surrender, reverence, and expectation (1 Timothy 2:8, Psalm 134:2).',
      '• Clapping & Shouting: Expressing victory and celebratory joy in God (Psalm 47:1).',
      '• Musical Instruments & Dance: King David worshipped with harps, drums, trumpets, and joyful dance (Psalm 150).',
      '• Praying Aloud Simultaneously: In Acts 4:24, the apostolic church "raised their voices together in prayer to God." Corporate vocal prayer fosters unity, fervent faith, and liberty in the Holy Spirit.'
    ],
    scriptures: [
      { ref: 'Psalm 150:3-6', text: '"Praise him with the sounding of the trumpet, praise him with the harp and lyre, praise him with timbrel and dancing... Let everything that has breath praise the Lord."' },
      { ref: '1 Timothy 2:8', text: '"Therefore I want the men everywhere to pray, lifting up holy hands without anger or disputing."' },
      { ref: 'John 4:24', text: '"God is spirit, and his worshipers must worship in the Spirit and in truth."' }
    ]
  },

  // Sanctification & Holy Living
  {
    id: 'sanctification-living',
    category: 'Sanctification & Holy Living',
    question: 'What is the doctrine of Sanctification and practical holiness?',
    shortAnswer: 'Sanctification is the ongoing, Spirit-empowered process of being separated from worldly sin and conformed to the pure character of Jesus Christ.',
    detailedAnswer: [
      'Pentecostals emphasize that true Holy Spirit fullness produces the fruit of the Spirit: love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control (Galatians 5:22-23).',
      'Holiness is not legalistic ritualism; it is genuine heartfelt consecration. We are called to live uprightly, renounce dishonesty, substance abuse, sexual immorality, gossip, and bitterness, reflecting Christ’s light in our families, workplaces, and tribal communities.',
      'This holy life is not sustained by human willpower, but by walking daily in fellowship with the Holy Spirit and feeding upon the Word of God.'
    ],
    scriptures: [
      { ref: '1 Thessalonians 4:3-4', text: '"It is God\'s will that you should be sanctified: that you should avoid sexual immorality; that each of you should learn to control your own body in a way that is holy and honorable."' },
      { ref: 'Hebrews 12:14', text: '"Make every effort to live in peace with everyone and to be holy; without holiness no one will see the Lord."' },
      { ref: 'Galatians 5:16', text: '"So I say, walk by the Spirit, and you will not gratify the desires of the flesh."' }
    ]
  },

  // End Times & Tribal Missions
  {
    id: 'blessed-hope-rapture',
    category: 'End Times & Tribal Missions',
    popular: true,
    question: 'What do Pentecostals believe regarding the Second Coming of Christ and the Rapture?',
    shortAnswer: 'We anticipate the Blessed Hope—the imminent return of Jesus Christ to catch up His Church, followed by the visible Millennial Reign and the New Creation.',
    detailedAnswer: [
      'Classical Pentecostalism holds a premillennial, dispensational understanding of biblical prophecy. The Lord Jesus Christ will return personally and bodily.',
      'We await the resurrection of those who have died in Christ and their translation together with those who are alive at His coming (commonly called the Rapture of the Church - 1 Thessalonians 4:16-17, 1 Corinthians 15:51-52).',
      'This Blessed Hope is not a cause for idle speculation, but a powerful motivator for urgent evangelism, holy living, and selfless service.'
    ],
    scriptures: [
      { ref: '1 Thessalonians 4:16-17', text: '"For the Lord himself will come down from heaven, with a loud command, with the voice of the archangel and with the trumpet call of God, and the dead in Christ will rise first. After that, we who are still alive and are left will be caught up together with them in the clouds to meet the Lord in the air."' },
      { ref: 'Titus 2:13', text: '"While we wait for the blessed hope—the appearing of the glory of our great God and Savior, Jesus Christ."' },
      { ref: 'Revelation 22:20', text: '"He who testifies to these things says, \'Yes, I am coming soon.\' Amen. Come, Lord Jesus."' }
    ]
  },
  {
    id: 'tribal-missions-urgency',
    category: 'End Times & Tribal Missions',
    question: 'Why are village evangelism and rural tribal missions so urgent for Pastor Samuel Soren?',
    shortAnswer: 'The Holy Spirit’s primary empowerment is for the Great Commission—reaching unreached Santali and rural villages with the life-changing message of Jesus Christ.',
    detailedAnswer: [
      'In the Santhal Parganas and remote forest tracts of Jharkhand and Bihar, hundreds of rural settlements have never heard the Gospel clearly or in their mother tongue (Santali / Hindi).',
      'The early Pentecostal revival sparked a global missionary explosion because believers recognized that the baptism in the Holy Spirit was given for soul-winning power (Acts 1:8).',
      'Pastor Samuel Soren and Sacred Assemblies Fellowship Church carry an unwavering mandate to plant indigenous churches, distribute free Bibles, mentor tribal youth, and demonstrate Christ\'s compassionate love through clean water, educational supplies, and relief aid.'
    ],
    scriptures: [
      { ref: 'Matthew 28:19-20', text: '"Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you."' },
      { ref: 'Mark 16:15', text: '"He said to them, \'Go into all the world and preach the gospel to all creation.\'"' },
      { ref: 'Romans 10:14-15', text: '"How, then, can they call on the one they have not believed in? And how can they believe in the one of whom they have not heard? And how can they hear without someone preaching to them?"' }
    ]
  }
];

export function FaithFaqPage({ onNavigate, onOpenDonate }: FaithFaqPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'spirit-baptism': true,
    'speaking-in-tongues': true
  });

  // Ask Question Form State
  const [askName, setAskName] = useState('');
  const [askEmail, setAskEmail] = useState('');
  const [askQuestion, setAskQuestion] = useState('');
  const [isSubmittingAsk, setIsSubmittingAsk] = useState(false);
  const [askSubmitted, setAskSubmitted] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const toggleAccordion = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleExpandAll = () => {
    const allOpen: Record<string, boolean> = {};
    FAQ_DATA.forEach((item) => {
      allOpen[item.id] = true;
    });
    setOpenItems(allOpen);
  };

  const handleCollapseAll = () => {
    setOpenItems({});
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const inQuestion = item.question.toLowerCase().includes(q);
      const inShort = item.shortAnswer.toLowerCase().includes(q);
      const inDetails = item.detailedAnswer.some((line) => line.toLowerCase().includes(q));
      const inScripture = item.scriptures.some(
        (s) => s.ref.toLowerCase().includes(q) || s.text.toLowerCase().includes(q)
      );

      return inQuestion || inShort || inDetails || inScripture;
    });
  }, [selectedCategory, searchQuery]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Pentecostal Faith FAQ - Pastor Samuel Soren',
        text: 'Biblical questions and answers regarding our Pentecostal faith, doctrine, Holy Spirit baptism, and divine healing.',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuestion.trim() || !askEmail.trim()) return;

    setIsSubmittingAsk(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: askName.trim() || 'Anonymous Seeker',
          email: askEmail.trim(),
          phone: '',
          subject: 'Pentecostal Faith & Doctrine Question',
          message: `FAITH QUESTION SUBMISSION:\n\n${askQuestion.trim()}`
        })
      });
      setAskSubmitted(true);
      setAskName('');
      setAskEmail('');
      setAskQuestion('');
    } catch (err) {
      console.error(err);
      // Still show thank you for user peace of mind
      setAskSubmitted(true);
    } finally {
      setIsSubmittingAsk(false);
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Hero Banner with Pentecostal Fire Theme */}
      <section className="relative bg-[#30203D] text-white overflow-hidden py-16 sm:py-20 border-b-4 border-[#C83338]">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#C83338] blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-500 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#C83338] font-bold text-xs uppercase tracking-widest mb-4 backdrop-blur-xs">
              <Flame className="w-4 h-4 text-[#C83338] fill-[#C83338]" />
              <span className="text-white">Pentecostal Doctrine & Biblical Answers</span>
            </div>

            <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-tight">
              Our Pentecostal Faith <br />
              <span className="text-[#C83338] font-extrabold">& What We Believe</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-neutral-200 leading-relaxed max-w-2xl">
              Clear, scripture-grounded answers to frequently asked questions about the Holy Spirit, speaking in tongues, divine healing, water baptism, and Spirit-led Christian living at Sacred Assemblies Fellowship Church under Pastor Samuel Soren.
            </p>

            {/* Quick Scripture Anchor */}
            <div className="mt-6 p-3 sm:p-4 rounded-xl bg-black/30 border border-white/10 text-xs sm:text-sm text-neutral-300 italic max-w-xl">
              &ldquo;For the promise is for you and your children and for all who are far off—for all whom the Lord our God will call.&rdquo;
              <span className="block not-italic font-bold text-[#C83338] text-xs mt-1">
                — Acts 2:39
              </span>
            </div>

            {/* Actions: Share & Print */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
              <button
                onClick={handleShare}
                className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center space-x-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedShare ? 'Link Copied!' : 'Share Faith FAQ'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
              {onOpenDonate && (
                <button
                  onClick={() => onOpenDonate('Rural Jharkhand Tribal Missions & Crusades')}
                  className="px-4 py-2 rounded-lg bg-[#C83338] hover:bg-[#b02a2f] text-white transition flex items-center space-x-1.5 shadow-md"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>Support Tribal Missions</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        
        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-neutral-200 mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctrines, scriptures, tongues, healing..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:border-[#C83338] focus:bg-white focus:outline-hidden transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-neutral-400 hover:text-neutral-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Expand / Collapse Controls */}
            <div className="flex items-center space-x-2 text-xs font-bold shrink-0 self-end sm:self-auto">
              <button
                onClick={handleExpandAll}
                className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
              >
                Expand All
              </button>
              <button
                onClick={handleCollapseAll}
                className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs font-semibold">
            {FAITH_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    active
                      ? 'bg-[#C83338] text-white shadow-xs font-bold'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-neutral-500 font-medium mb-6 px-1">
          <span>
            Showing <strong>{filteredFaqs.length}</strong> biblical doctrine questions
            {selectedCategory !== 'All' && ` in "${selectedCategory}"`}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
          <span className="hidden sm:inline">
            Pastor Samuel Soren &middot; Sacred Assemblies Fellowship Church
          </span>
        </div>

        {/* FAQ Accordion List */}
        {filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200 shadow-xs max-w-lg mx-auto">
            <HelpCircle className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-lg text-neutral-800">
              No matching doctrinal questions found
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Try searching with different terms, or browse another category. You can also submit your question directly to Pastor Samuel Soren below.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-[#C83338] text-white text-xs font-bold rounded-lg hover:bg-[#b02a2f] transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const isOpen = !!openItems[faq.id];
              return (
                <div
                  key={faq.id}
                  id={faq.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                    isOpen
                      ? 'border-[#C83338]/40 ring-1 ring-[#C83338]/20'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 group focus:outline-hidden"
                    aria-expanded={isOpen}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#C83338] bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                          {faq.category}
                        </span>
                        {faq.popular && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            Core Foundation
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading font-bold text-base sm:text-lg text-[#252525] group-hover:text-[#C83338] transition-colors leading-snug">
                        {faq.question}
                      </h3>
                      {!isOpen && (
                        <p className="text-xs sm:text-sm text-neutral-500 line-clamp-2 mt-1">
                          {faq.shortAnswer}
                        </p>
                      )}
                    </div>

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? 'bg-[#C83338] text-white rotate-180'
                          : 'bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Accordion Expanded Content */}
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-neutral-100 text-neutral-700 text-sm leading-relaxed space-y-4 animate-in fade-in duration-200">
                      
                      {/* Detailed Explanations */}
                      <div className="space-y-3">
                        {faq.detailedAnswer.map((para, idx) => (
                          <p key={idx} className="text-neutral-700 text-sm leading-relaxed">
                            {para}
                          </p>
                        ))}
                      </div>

                      {/* Scripture Callouts */}
                      <div className="bg-purple-50/60 border-l-4 border-[#30203D] rounded-r-xl p-4 space-y-2 mt-4">
                        <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#30203D]">
                          <BookOpen className="w-4 h-4 text-[#C83338]" />
                          <span>Biblical References & Foundations:</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          {faq.scriptures.map((sc, sidx) => (
                            <div key={sidx} className="bg-white p-2.5 rounded-lg border border-purple-100 shadow-2xs">
                              <span className="font-bold text-[#C83338] block mb-0.5">
                                {sc.ref}
                              </span>
                              <p className="italic text-neutral-600">
                                {sc.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 16 Fundamentals Summary Box */}
        <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-neutral-200 pb-6 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C83338]">
                <Shield className="w-4 h-4" />
                <span>Historic Statement of Faith</span>
              </div>
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#252525]">
                Key Tenets of Our Pentecostal Fellowship
              </h2>
              <p className="text-xs text-neutral-500">
                Grounding our teachings in the infallible Word of God at Sacred Assemblies Fellowship Church.
              </p>
            </div>
            <button
              onClick={() => onNavigate('about')}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shrink-0"
            >
              <span>About Pastor Samuel Soren</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="font-bold text-[#C83338] block text-sm mb-1">1. The Inspired Word</span>
              <p className="text-neutral-600 leading-relaxed">
                The Holy Bible is the fully inspired, infallible, and inerrant written revelation of God to mankind.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="font-bold text-[#C83338] block text-sm mb-1">2. The Living Godhead</span>
              <p className="text-neutral-600 leading-relaxed">
                One God eternally self-existent as Father, Son, and Holy Spirit in perfect divine unity.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="font-bold text-[#C83338] block text-sm mb-1">3. Deity of Jesus Christ</span>
              <p className="text-neutral-600 leading-relaxed">
                His virgin birth, sinless life, substitutionary atoning death, bodily resurrection, and ascension.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="font-bold text-[#C83338] block text-sm mb-1">4. Salvation by Grace</span>
              <p className="text-neutral-600 leading-relaxed">
                Forgiveness of sins received solely through faith in the blood of Jesus Christ, not by works.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="font-bold text-[#C83338] block text-sm mb-1">5. Holy Spirit Baptism</span>
              <p className="text-neutral-600 leading-relaxed">
                A divine clothing with power for life and service, with the initial sign of speaking in other tongues.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="font-bold text-[#C83338] block text-sm mb-1">6. Divine Healing</span>
              <p className="text-neutral-600 leading-relaxed">
                Physical deliverance and supernatural healing provided in the Atonement for all believers.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="font-bold text-[#C83338] block text-sm mb-1">7. Water Immersion</span>
              <p className="text-neutral-600 leading-relaxed">
                Baptism by full immersion in water signifying death to sin and resurrection into new life.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="font-bold text-[#C83338] block text-sm mb-1">8. Practical Holiness</span>
              <p className="text-neutral-600 leading-relaxed">
                A sanctified lifestyle of moral purity, self-control, and loving service empowered by the Spirit.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="font-bold text-[#C83338] block text-sm mb-1">9. The Blessed Hope</span>
              <p className="text-neutral-600 leading-relaxed">
                The imminent personal return of our Lord Jesus Christ to catch up His Church and establish His Kingdom.
              </p>
            </div>
          </div>
        </div>

        {/* Ask Pastor Samuel Soren a Theological Question */}
        <div className="mt-12 bg-linear-to-br from-[#30203D] to-[#252525] rounded-2xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#C83338] flex items-center justify-center mx-auto mb-3 shadow-md">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-wide">
                Have a Question About Our Faith?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
                Do you have a question regarding scripture, spiritual gifts, Holy Spirit baptism, or Christian discipleship? Send your inquiry directly to Pastor Samuel Soren and our pastoral team.
              </p>
            </div>

            {askSubmitted ? (
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto" />
                <h4 className="font-heading font-bold text-lg text-white">
                  Thank You for Reaching Out!
                </h4>
                <p className="text-xs text-neutral-200 leading-relaxed">
                  Your question has been received by Pastor Samuel Soren’s ministry office. We will reply to your email with biblical guidance and prayer.
                </p>
                <button
                  onClick={() => setAskSubmitted(false)}
                  className="mt-2 text-xs text-[#C83338] hover:underline font-bold"
                >
                  Ask Another Question
                </button>
              </div>
            ) : (
              <form onSubmit={handleAskSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={askName}
                      onChange={(e) => setAskName(e.target.value)}
                      placeholder="e.g. Brother David"
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder:text-neutral-400 focus:outline-hidden focus:border-[#C83338] focus:bg-white/15"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                      Your Email <span className="text-[#C83338]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={askEmail}
                      onChange={(e) => setAskEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder:text-neutral-400 focus:outline-hidden focus:border-[#C83338] focus:bg-white/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Your Question or Doctrinal Inquiry <span className="text-[#C83338]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={askQuestion}
                    onChange={(e) => setAskQuestion(e.target.value)}
                    placeholder="Ask about receiving the Holy Spirit, water baptism, worship, or practical Christian living..."
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder:text-neutral-400 focus:outline-hidden focus:border-[#C83338] focus:bg-white/15"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAsk}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#C83338] hover:bg-[#a62529] font-heading font-bold text-sm uppercase tracking-wider text-white shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingAsk ? 'Submitting Question...' : 'Submit Question to Pastor'}</span>
                </button>
              </form>
            )}

            {/* Fellowship Gathering Callout */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-neutral-300">
              <p>
                Want to experience Pentecostal worship in person? Join us every Sunday at 09:00 AM IST at{' '}
                <strong className="text-white">Sacred Assemblies Fellowship Church</strong>, Guru Nagar, Gangta, Godda, Jharkhand.
              </p>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}

export default FaithFaqPage;
